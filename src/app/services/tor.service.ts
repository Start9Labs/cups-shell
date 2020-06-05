import { Injectable } from '@angular/core'
import { Tor } from 'capacitor-tor'
import { Observable, BehaviorSubject, Subscription } from 'rxjs'
import { NetworkMonitor } from './network.service'
import { NetworkStatus } from '@capacitor/core'
import { Platform, LoadingController } from '@ionic/angular'

@Injectable({
  providedIn: 'root',
})
export class TorService {
  static readonly PORT = 59591
  private readonly tor = new Tor()
  private readonly progress$ = new BehaviorSubject<number>(0)
  private readonly connection$ = new BehaviorSubject<TorConnection>(TorConnection.uninitialized)
  networkSub: Subscription
  watchProgress (): Observable<number> { return this.progress$.asObservable() }
  watchConnection (): Observable<TorConnection> { return this.connection$.asObservable() }

  constructor (
    private readonly platform: Platform,
    private readonly loadingCtrl: LoadingController,
    private readonly networkMonitor: NetworkMonitor,
  ) { }

  init (): void {
    this.networkSub = this.networkSub || this.networkMonitor.watch().subscribe(n => this.handleNetworkChange(n))
  }

  async start (): Promise<void> {
    // ** MOCKS **
    // return this.mock()

    if (!this.platform.is('ios') && !this.platform.is('android')) { return }
    if (await this.tor.isRunning()) { return }

    console.log('starting Tor')

    this.connection$.next(TorConnection.in_progress)

    const loader = await this.loadingCtrl.create({
      spinner: 'lines',
      cssClass: 'loader',
      message: 'Tor connecting: 0%',
    })
    await loader.present()

    this.connection$.next(TorConnection.in_progress)

    this.tor.start({ socksPort: TorService.PORT, initTimeout: 40000 }).subscribe({
      next: (progress: number) => this.handleConnecting(progress, loader),
      error: (err: string) => {
        this.connection$.next(TorConnection.disconnected)
        loader.dismiss()
        throw new Error(`Error connecting to Tor: ${err}`)
      },
    })
  }

  async stop (): Promise<void> {
    console.log('TOR STOP?')
    if (!this.platform.is('ios') && !this.platform.is('android')) { return }

    if (await this.tor.isRunning()) {
      console.log('stopping Tor')
      try {
        this.tor.stop()
        this.progress$.next(0)
        this.connection$.next(TorConnection.disconnected)
      } catch (e) {
        console.log(`Tor stop failed: ${e}`)
      }
    }
  }

  private async restart (): Promise<void> {
    console.log('restarting Tor')
    await this.stop()
    this.start()
  }

  private async reconnect (): Promise<void> {
    if (!this.platform.is('ios') && !this.platform.is('android')) { return }

    console.log('reconnecting Tor')
    try {
      await this.tor.reconnect()
      this.connection$.next(TorConnection.connected)
    } catch (e) {
      console.log(`Tor reconnect failed: ${e}`)
      await this.restart()
    }
  }

  private async handleNetworkChange (network: NetworkStatus): Promise<void> {
    // if connected to Internet, connect or reconnect to Tor
    if (network.connected) {
      if (this.platform.is('desktop')) { this.start(); return }

      if (await this.tor.isRunning()) {
        await this.reconnect()
      } else {
        await this.start()
      }
    }
  }

  private async handleConnecting (progress: number, loader: HTMLIonLoadingElement) {
    this.progress$.next(progress)
    loader.message = `Tor connecting: ${progress}%`

    if (progress === 100) {
      this.connection$.next(TorConnection.connected)
      await loader.dismiss()
    }
  }

  private async  mock (): Promise<void> {
    console.log('starting Tor')
    this.connection$.next(TorConnection.in_progress)

    const loader = await this.loadingCtrl.create({
      spinner: 'lines',
      cssClass: 'loader',
      message: 'Tor connecting: 0%',
    })
    await loader.present()

    setTimeout(() => { this.handleConnecting(25, loader) }, 500)
    setTimeout(() => { this.handleConnecting(40, loader) }, 1000)
    setTimeout(() => { this.handleConnecting(60, loader) }, 1500)
    setTimeout(() => { this.handleConnecting(90, loader) }, 1800)
    setTimeout(() => { this.handleConnecting(100, loader) }, 2500)
  }
}

export enum TorConnection {
  uninitialized = 'uninitialized',
  in_progress = 'in_progress',
  connected = 'connected',
  disconnected = 'disconnected',
  reconnecting = 'reconnecting',
}
