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
  webview: WebviewPluginNative = new WebviewPluginNative()
  torSub: Subscription
  webviewLoading = true
  torLoading = false

  constructor (
    private readonly navCtrl: NavController,
    private readonly torService: TorService,
    // private readonly backgroundService: BackgroundService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    // listen for webview update event
    this.webview.onUpdate(async (body: { appId: string, oldVersion: string, newVersion: string }) => {
      console.log('WEBVIEW UPDATE DETECTED')
      this.webviewLoading = true
      await this.webview.clearCache(body.appId, '*')
      console.log('CALLING WEBVIEW RELOAD')
      this.webview.reload()
    })
    // watch Tor connection
    this.torSub = this.torService.watchConnection().subscribe(c => {
      this.zone.run(() => {
        if (c === TorConnection.in_progress) {
          this.torLoading = true
        } else if (c === TorConnection.connected) {
          this.torLoading = false
        }
      })
    })
    // listen for app resume
    App.addListener('appStateChange', async state => {
      console.log('STATE CHANGE', state)
      if (state.isActive) {
        console.log('ITS ACTIVE')
        const tempSub = this.torService.watchConnection().subscribe(async c => {
          console.log('TOR CONNECION', c)
          if (c === TorConnection.connected) {
            try {
              console.log('CHECKING FOR UPDATES')
              await this.webview.checkForUpdates()
              console.log('CHECK COMPLETE')
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

  ngAfterViewInit () {
    this.createWebview()
  }

  private async createWebview (): Promise<void> {
    this.webview.open({
      url: `onion://${this.store.torAddress}`,
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
            this.zone.run(() => {
              this.webviewLoading = false
            })
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
      return this.store.password
    }
  }

  private async close (): Promise<void> {
    // this.backgroundService.removeListener()
    await this.store.removePassword()
    this.webview.close()
    this.zone.run(() => { this.navCtrl.navigateRoot(['/home']) })
  }
}
