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

    const res = await HttpPluginNativeImpl.request(options)
    return res.data || { }
  }
}
