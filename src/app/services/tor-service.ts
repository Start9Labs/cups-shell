import { Injectable } from '@angular/core'
import { TorClient, HttpRequest } from 'capacitor-tor-client'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TorService {
  private readonly torClient = new TorClient()
  progress$ = new BehaviorSubject<number>(0)

  async init (): Promise<void> {
    // this.torClient.initTor().subscribe(progress => {
    //   this.progress$.next(progress)
    //   if (progress === 1) { this.progress$.complete() }
    // })

    setTimeout(() => { this.progress$.next(.25) }, 1000)
    setTimeout(() => { this.progress$.next(.5) }, 2000)
    setTimeout(() => { this.progress$.next(.75) }, 3000)
    setTimeout(() => { this.progress$.next(1); this.progress$.complete() }, 4000)
  }

  async request (options: HttpRequest): Promise<any> {
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
