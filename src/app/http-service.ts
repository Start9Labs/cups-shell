import { Injectable } from '@angular/core'
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx'
import { TorClient, HttpRequest, HttpVerb } from 'capacitor-tor-client'
import { WebServer, Request, Response } from '@ionic-native/web-server/ngx'
import BiMap from 'bimap'
import { Storage } from '@ionic/storage'

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly torClient = new TorClient()
  private port = 8081
  private portMap: BiMap<number, string> = new BiMap()
  private services: { [port: number]: WebServer } = {}

  constructor(
    private readonly webServer: WebServer,
    private readonly http: HTTP,
    private readonly storage: Storage,
  ) {
  }

  async initTor(): Promise<void> {
    await this.torClient.initTor()
  }

  async initProxy(baseUrl: string): Promise<number> {
    let port = this.portMap.val(baseUrl)
    if (port) {
      return port
    }
    const server = new WebServer()
    port = this.port++

    server.onRequest().subscribe(data => {
      this.handler(baseUrl)(data)
        .then(res => server.sendResponse(data.requestId, res)
          .catch(console.error))
    })
    await server.start(port) // hopefully this wont run forever

    this.portMap.push(port, baseUrl)
    this.services[port] = server
    return port
  }

  async shutdownProxy(portOrUrl: string | number): Promise<void> {
    let service: WebServer
    // port
    if (typeof portOrUrl === 'number') {
      service = this.services[portOrUrl]
      // url
    } else {
      service = this.services[this.portMap.val(portOrUrl)]
    }
    if (service) {
      await service.stop()
    }
  }

  handler(baseUrl: string): (data: Request) => Promise<Response> {
    return async (data: Request) => {
      console.log(data)
      const cached = await this.storage.get(`cache:${baseUrl}:${data.path}`)
      if (cached) {
        return cached
      }

      const res = await this.http.get(`http://${baseUrl}/${data.path}`, null, null)

      const result: Response = {
        status: res.status,
        body: res.data,
        headers: res.headers
      }
      await this.storage.set(`cache:${baseUrl}:${data.path}`, result)

      return result
    }
  }

  async request(options: HttpRequest): Promise<any> {
    this.http.setDataSerializer('json')

    try {
      return this.torClient.sendReq(options)
    } catch (e) {
      console.error(e)
      let message: string
      try {
        message = JSON.parse(e.error).message
      } catch (e) {
        message = e.error
      }
      throw new Error(message || 'Unknown Error')
    }
  }
}
