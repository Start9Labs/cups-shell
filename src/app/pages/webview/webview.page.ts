import { Component, ElementRef, ViewChild, NgZone } from '@angular/core'
import { NavController } from '@ionic/angular'
// import { BackgroundService } from 'src/app/services/background-service'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { TorService, TorConnection } from 'src/app/services/tor.service'
import { Store } from 'src/app/store'
import { Subscription } from 'rxjs'

import { Plugins } from '@capacitor/core'
const { App } = Plugins

@Component({
  selector: 'app-webview',
  templateUrl: 'webview.page.html',
  styleUrls: ['webview.page.scss'],
})
export class WebviewPage {
  @ViewChild('webviewEl') webviewEl: ElementRef
  webview: WebviewPluginNative
  torSub: Subscription
  webviewLoading = true
  torLoading = false
  cancelable = null

  constructor (
    private readonly navCtrl: NavController,
    private readonly torService: TorService,
    // private readonly backgroundService: BackgroundService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    this.setLoading()
  }

  ngAfterViewInit () {
    // watch Tor connection
    this.torSub = this.torService.watchConnection().subscribe(c => {
      this.zone.run(() => {
        if (c === TorConnection.in_progress) {
          this.torLoading = true
        } else if (c === TorConnection.connected) {
          this.torLoading = false
          if (!this.webview) {
            this.createWebview()
          }
        }
      })
    })
    // listen for app resume
    App.addListener('appStateChange', async state => {
      if (state.isActive) {
        const tempSub = this.torService.watchConnection().subscribe(async c => {
          if (c === TorConnection.connected) {
            try {
              if (this.webview) { await this.webview.checkForUpdates() }
            } catch (e) {
              console.error(e)
            } finally {
              tempSub.unsubscribe()
            }
          }
        })
      }
    })
  }

  ngOnDestroy () {
    this.torSub.unsubscribe()
  }

  private setLoading (): void {
    this.webviewLoading = true
    if (this.cancelable) {
      this.cancelable.reject()
      this.cancelable = null
    }
    new Promise((res, rej) => {
      this.cancelable = { reject: rej }
      setTimeout(() => {
        res()
      }, 60000)
    }).then(() => {
      this.zone.run(() => { this.webviewLoading = false })
      this.cancelable = null
    }).catch(() => { })
  }

  private async createWebview (): Promise<void> {
    this.webview = new WebviewPluginNative()

    // listen for webview update event
    this.webview.onUpdate(async (body: { appId: string, oldVersion: string, newVersion: string }) => {
      this.zone.run(() => {
        this.setLoading()
      })
      await this.webview.clearCache(body.appId, '*')
      this.webview.reload()
    })

    this.webview.open({
      url: `onion://${this.store.peekTorAddress()}`,
      element: this.webviewEl.nativeElement,
      torproxy: {
        protocol: 'SOCKS',
        host: '127.0.0.1',
        port: TorService.PORT,
      },
      rpchandler: async (_host: string, method: string, data: any) => {
        switch (method) {
          case '/parentReady':
            return this.store.platformReady
          case '/childReady':
            this.zone.run(() => { this.webviewLoading = false })
            break
          case '/getConfigValue':
            return this.getConfigValue(data[0])
          case '/close':
            return this.close()
          default:
            throw new Error('unimplemented')
        }
      },
    })
  }

  private async getConfigValue (key: string): Promise<any> {
    if (key === 'password') {
      return this.store.peekPassword()
    }
  }

  private async close (): Promise<void> {
    // this.backgroundService.removeListener()
    await this.store.removePassword()
    this.webview.close()
    this.webview = undefined
    this.zone.run(() => { this.navCtrl.navigateRoot(['/home']) })
  }
}
