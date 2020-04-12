import { Injectable } from '@angular/core'
import { HTTP } from '@ionic-native/http/ngx'
import { TorClient, HttpRequest } from 'capacitor-tor-client'

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly torClient = new TorClient()

  constructor (
    private readonly http: HTTP,
  ) {
  }

  async initTor (): Promise<void> {
    await this.torClient.initTor()
  }

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
