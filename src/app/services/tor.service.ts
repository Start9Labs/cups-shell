import { Injectable } from '@angular/core'
import { Tor } from '@start9labs/capacitor-tor'
import { Observable, BehaviorSubject, Subscription } from 'rxjs'
import { NetworkMonitor } from './network.service'
import { NetworkStatus } from '@capacitor/core'
import { Platform } from '@ionic/angular'
import { WebviewPluginNative } from 'capacitor-s9-webview'

@Injectable({
  providedIn: 'root',
})
export class TorService {
  static readonly PORT = 59592
  static readonly CONTROL_PORT = 59593
  private readonly tor = new Tor()
  private readonly progress$ = new BehaviorSubject<number>(0)
  private readonly connection$ = new BehaviorSubject<TorConnection>(TorConnection.uninitialized)
  private networkSub: Subscription
  private webview: WebviewPluginNative
  watchProgress (): Observable<number> { return this.progress$.asObservable() }
  watchConnection (): Observable<TorConnection> { return this.connection$.asObservable() }
  peakProgress (): number { return this.progress$.getValue() }
  peakConnection (): TorConnection { return this.connection$.getValue() }

  constructor (
    private readonly platform: Platform,
    private readonly networkMonitor: NetworkMonitor,
  ) { }

  init (): void {
    this.webview = this.webview || new WebviewPluginNative()
    this.networkSub = this.networkSub || this.networkMonitor.watch().subscribe(n => this.handleNetworkChange(n))
  }

  async start (): Promise<void> {
    // ** MOCKS **
    // return this.mock()

    if (!this.platform.is('ios') && !this.platform.is('android')) { return }
    if (await this.tor.isRunning()) { return }

    console.log('starting Tor')

    this.connection$.next(TorConnection.in_progress)

    this.tor.start({ socksPort: TorService.PORT, controlPort: TorService.CONTROL_PORT, initTimeout: 60000 }).subscribe({
      next: (progress: number) => this.handleConnecting(progress),
      error: (e) => {
        console.error(e)
        this.connection$.next(TorConnection.failed)
        this.connection$.next(TorConnection.disconnected)
      },
    })
  }

  async stop (): Promise<void> {
    if (!this.platform.is('ios') && !this.platform.is('android')) { return }

    if (await this.tor.isRunning()) {
      console.log('stopping Tor')
      try {
        await this.webview.torStopped()
        this.progress$.next(0)
        this.connection$.next(TorConnection.disconnected)
        this.tor.stop()
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
      this.handleConnected()
    } catch (e) {
      console.log(`Tor reconnect failed: ${e}`)
      await this.restart()
    }
  }

  private async handleNetworkChange (network: NetworkStatus): Promise<void> {
    // if connected to Internet, connect or reconnect to Tor
    if (network.connected) {
      // hack for local testing
      if (this.platform.is('desktop')) { this.start(); return }

      if (await this.tor.isRunning()) {
        await this.reconnect()
      } else {
        await this.start()
      }
    }
  }

  private async handleConnecting (progress: number) {
    this.progress$.next(progress)
    if (progress === 100) {
      this.handleConnected()
    }
  }

  private async handleConnected (): Promise<void> {
    this.connection$.next(TorConnection.connected)
    await this.webview.torStarted()
  }

  private async  mock (): Promise<void> {
    console.log('starting Tor')
    this.connection$.next(TorConnection.in_progress)

    setTimeout(() => { this.handleConnecting(25) }, 500)
    setTimeout(() => { this.handleConnecting(40) }, 1000)
    setTimeout(() => { this.handleConnecting(60) }, 1500)
    setTimeout(() => { this.handleConnecting(90) }, 1800)
    setTimeout(() => { this.handleConnecting(100) }, 2500)
  }
}

export enum TorConnection {
  uninitialized = 'uninitialized',
  in_progress = 'in_progress',
  connected = 'connected',
  disconnected = 'disconnected',
  failed = 'failed',
}
