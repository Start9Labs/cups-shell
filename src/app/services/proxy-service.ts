import { Injectable } from '@angular/core'
import { WebServer, Request, Response } from '@ionic-native/web-server/ngx'
import BiMap from 'bimap'
import { HttpService, Method } from './http-service'

import { Plugins } from '@capacitor/core'
import { Store } from '../store'
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
  ) {
  }

  async init (): Promise<number> {
    let port = this.portMap.val(this.store.torAddress)
    if (port) {
      return port
    }
    const server = new WebServer()
    port = this.port++

    server.onRequest().subscribe(req => {
      this.handler(this.store.torAddress, req)
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

  async handler (baseUrl: string, req: Request): Promise<Response> {
    const shouldCache = req.headers['cache-control'] !== 'no-store'

    if (shouldCache) {
      const cached = (await Storage.get({ key: `cache:${baseUrl}:${req.path}` })).value
      if (cached) {
        return JSON.parse(cached)
      }
    }

    const res = await this.httpService.rawRequest(`http://${baseUrl}/${req.path}`, {
      method: req.method.toLowerCase() as Method,
      headers: JSON.parse(req.headers),
      data: JSON.parse(req.body),
      params: JSON.parse(req.query),
    })

    delete res.headers['content-encoding']
    res.headers['content-length'] = String(res.data.length)
    res.headers['cache-control'] = 'no-store'

    const result: Response = {
      status: res.status,
      body: res.data,
      headers: res.headers,
    }

    if (shouldCache) {
      await Storage.set({
        key: `cache:${baseUrl}:${req.path}`,
        value: JSON.stringify(result),
      })
    }

    return result
  }
}
