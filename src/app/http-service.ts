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
  private services: { [port: number]: WebServer } = { }

  constructor (
    private readonly http: HTTP,
    private readonly storage: Storage,
  ) {
  }

  async initTor (): Promise<void> {
    await this.torClient.initTor()
  }

  async initProxy (baseUrl: string): Promise<number> {
    let port = this.portMap.val(baseUrl)
    if (port) {
      return port
    }
    const server = new WebServer()
    port = this.port++

    server.onRequest().subscribe(req => {
      this.handler(baseUrl, req)
        .then(res => server.sendResponse(req.requestId, res)
        .catch(console.error))
    })
    await server.start(port) // hopefully this wont run forever

    this.portMap.push(port, baseUrl)
    this.services[port] = server
    return port
  }

  async shutdownProxy (portOrUrl: string | number): Promise<void> {
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

  async handler (baseUrl: string, req: Request): Promise<Response> {
    console.log(req)
    const shouldCache = req.headers['cache-control'] !== 'no-store'

    if (shouldCache) {
      const cached = await this.storage.get(`cache:${baseUrl}:${req.path}`)
      if (cached) {
        return cached
      }
    }

    const res = await this.http.get(`http://${baseUrl}/${req.path}`, null, null)

    console.log('** res **', res)

    delete res.headers['content-encoding']
    res.headers['content-length'] = String(res.data.length)
    res.headers['cache-control'] = 'no-store'

    const result: Response = {
      status: res.status,
      body: res.data,
      headers: res.headers,
    }

    if (shouldCache) {
      await this.storage.set(`cache:${baseUrl}:${req.path}`, result)
    }

    return result
  }

  // async handler (baseUrl: string, req: Request): Promise<Response> {
  //   console.log(req)
  //   const shouldCache = req.headers['cache-control'] !== 'no-store'

  //   if (shouldCache) {
  //     const cached = await this.storage.get(`cache:${baseUrl}:${req.path}`)
  //     if (cached) {
  //       return cached
  //     }
  //   }

  //   const res = await this.torClient.sendReq({
  //     verb: HttpVerb.GET,
  //     host: baseUrl,
  //     path: req.path,
  //     port: 80,
  //   })

  //   console.log('** res **', res)

  //   res.headers['cache-control'] = 'no-store'

  //   delete res.headers['content-encoding']
  //   res.headers['content-length'] = String(res.data.length)

  //   const result: Response = {
  //     status: res.status,
  //     body: res.data,
  //     headers: res.headers,
  //   }

  //   if (shouldCache) {
  //     await this.storage.set(`cache:${baseUrl}:${req.path}`, result)
  //   }

  //   return result
  // }

  async request (options: HttpRequest): Promise<any> {
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
