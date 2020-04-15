import { Injectable } from '@angular/core'
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx'

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor (
    private readonly http: HTTP,
  ) { }

  async request<T> (url: string, options: HttpNativeOptions): Promise<T> {
    const res = await this.rawRequest(url, options)
    return res.data
  }

  async rawRequest (url: string, options: HttpNativeOptions): Promise<HTTPResponse> {
    console.log('** REQ **', url, options)
    const res = await this.http.sendRequest(url, options)
    console.log('** RES **', res)
    return res
  }
}

export interface HttpNativeOptions {
  method: Method
  data?: {
    [key: string]: any
  }
  params?: {
    [key: string]: string | number
  }
  serializer?: 'json' | 'urlencoded' | 'utf8' | 'multipart'
  timeout?: number // seconds
  headers?: {
    [key: string]: string
  }
  filePath?: string | string[]
  name?: string | string[]
  responseType?: 'text' | 'arraybuffer' | 'blob' | 'json'
}

export enum Method {
  get = 'get',
  post = 'post',
  put = 'put',
  patch = 'patch',
  head = 'head',
  delete = 'delete',
  upload = 'upload',
  download = 'download',
}

export interface Response<T> extends HTTPResponse {
  data: T
}
