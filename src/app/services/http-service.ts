import { Injectable } from '@angular/core'
import { HttpPluginNativeImpl, HttpResponse, HttpOptions } from 'capacitor-http'
import { Store } from '../store'

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor (
    private readonly store: Store,
  ) { }

  async request<T> (options: HttpOptions): Promise<T> {
    const res = await this.rawRequest(options)
    return res.data
  }

  async rawRequest (options: HttpOptions): Promise<HttpResponse> {
    options.url = `http://${this.store.torAddress}${options.url}`
    options.proxy = {
      host: 'localhost',
      port: 59590,
      protocol: 'SOCKS',
    }
    console.log('** REQ **', options)
    const res = await HttpPluginNativeImpl.request(options)
    console.log('** RES **', res)
    return res
  }

  async exactRequest (options: HttpOptions): Promise<HttpResponse> {
    return HttpPluginNativeImpl.request(options)
  }
}
