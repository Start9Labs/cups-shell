import { Injectable } from '@angular/core'
import { Tor } from 'capacitor-tor'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TorService {
  static readonly PORT = 59590
  private readonly tor = new Tor()
  private progress$ = new BehaviorSubject<number>(0)
  watchProgress (): Observable<number> { return this.progress$.asObservable() }

  async init (): Promise<void> {
    this.tor.start({ socksPort: TorService.PORT, initTimeout: 60000 }).subscribe({
      next: (progress: number) => {
        this.progress$.next(progress)
      },
      error: (err: string) => {
        throw new Error(`Error connecting to Tor: ${err}`)
      },
    })

    // setTimeout(() => { this.progress$.next(25) }, 1500)
    // setTimeout(() => { this.progress$.next(40) }, 2000)
    // setTimeout(() => { this.progress$.next(60) }, 3000)
    // setTimeout(() => { this.progress$.next(90) }, 4500)
    // setTimeout(() => { this.progress$.next(100) }, 5500)
  }
}
