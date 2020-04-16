import { Injectable } from '@angular/core'
import { WebServer, Request, Response } from '@ionic-native/web-server/ngx'
import BiMap from 'bimap'
import { HttpService } from './http-service'
import { Store } from '../store'

import { Plugins } from '@capacitor/core'
const { Storage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class ProxyService {
  private port = 8081
  private portMap: BiMap<number, string> = new BiMap()
  private services: { [port: number]: WebServer } = { }

  constructor (
    private readonly httpService: HttpService,
    private readonly store: Store,
  ) { }

  async init (): Promise<number> {
    let port = this.portMap.val(this.store.torAddress)
    console.log('** PORT **', port)
    if (port) {
      return port
    }
    const server = new WebServer()
    port = this.port++
    port = port++
    console.log('** PORT 2 **', port)

    server.onRequest().subscribe(req => {
      this.handler(req)
        .then(res => server.sendResponse(req.requestId, res)
        .catch(console.error))
    })
    await server.start(port) // hopefully this wont run forever

    this.portMap.push(port, this.store.torAddress)
    this.services[port] = server
    return port
  }

  async shutdown (portOrUrl: string | number): Promise<void> {
    let service: WebServer
    // port
    if (typeof portOrUrl === 'number') {
      service = this.services[portOrUrl]
    // url
    } else {
      service = this.services[this.portMap.val(portOrUrl)]
    }
    // only stop if exists
    if (service) {
      await service.stop()
    }
  }

  private async handler (req: Request): Promise<Response> {
    const baseUrl = this.store.torAddress
    const storageKey = `cache:${baseUrl}:${req.path}`

    const shouldCache = req.headers['Cache-Control'] !== 'no-store'

    if (shouldCache) {
      const cached = (await Storage.get({ key: storageKey })).value
      if (cached) {
        return JSON.parse(cached)
      }
    }

    console.log('** PROXY REQUEST **', req)

    const res = await this.httpService.rawRequest({
      method: req.method,
      url: req.path,
      // params: req.query,
      // data: req.body,
      headers: req.headers as any,
    })

    delete res.headers['Content-Encoding']
    res.headers['Content-Length'] = String(res.data.length)
    res.headers['Cache-Control'] = 'no-store'

    const result: Response = {
      status: res.status,
      body: res.data,
      headers: res.headers,
    }

    if (shouldCache) {
      await Storage.set({
        key: storageKey,
        value: JSON.stringify(result),
      })
    }

    return result
  }
}
