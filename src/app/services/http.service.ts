import { Injectable } from '@angular/core'
import { HttpPluginNativeImpl, HttpOptions } from 'capacitor-http'
import { TorService } from './tor.service'

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  async torRequest<T> (options: HttpOptions): Promise<T> {
    options.headers = Object.assign(options.headers || { }, {
      'Content-Type': 'application/json',
    })
    options.proxy = {
      host: 'localhost',
      port: TorService.PORT,
      protocol: 'SOCKS',
    }
    options.url = `http://${options.url}`

    try {
      console.log('** REQ **', options)
      const res = await HttpPluginNativeImpl.request(options)
      console.log('** RES **', res)
      return res.data || { }
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
