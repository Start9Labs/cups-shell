import { Injectable } from '@angular/core'
import { Tor } from 'capacitor-tor'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TorService {
  private readonly tor = new Tor()
  progress$ = new BehaviorSubject<number>(0)

  async init (): Promise<void> {
    this.tor.start().subscribe(progress => {
      this.progress$.next(progress)
    })

    // setTimeout(() => { this.progress$.next(25) }, 1500)
    // setTimeout(() => { this.progress$.next(40) }, 2000)
    // setTimeout(() => { this.progress$.next(60) }, 3000)
    // setTimeout(() => { this.progress$.next(90) }, 4500)
    // setTimeout(() => { this.progress$.next(100) }, 5500)
  }
}
