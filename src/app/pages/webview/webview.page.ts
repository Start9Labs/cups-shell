import { Component, ElementRef, ViewChild, NgZone } from '@angular/core'
import { NavController, LoadingController, AlertController } from '@ionic/angular'
// import { BackgroundService } from 'src/app/services/background-service'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { TorService, TorConnection } from 'src/app/services/tor.service'
import { Store } from 'src/app/store'

import { Plugins, PluginListenerHandle } from '@capacitor/core'
const { App } = Plugins

@Component({
  selector: 'app-webview',
  templateUrl: 'webview.page.html',
  styleUrls: ['webview.page.scss'],
})
export class WebviewPage {
  @ViewChild('webviewEl') webviewEl: ElementRef
  webview: WebviewPluginNative = new WebviewPluginNative()
  webviewIndexLoaded = false
  webviewLoading = true
  resumeSub: PluginListenerHandle
  cancelable = null
  loader: HTMLIonLoadingElement

  constructor (
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController,
    private readonly loadingCtrl: LoadingController,
    private readonly torService: TorService,
    // private readonly backgroundService: BackgroundService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    // initialize Tor if not already
    if (this.torService.peakConnection() === TorConnection.uninitialized) {
      this.torService.init()
    }
    // listen for app resume
    this.resumeSub = App.addListener('appStateChange', async state => {
      if (state.isActive && this.webviewIndexLoaded) {
        await this.webview.checkForUpdates(60).catch(console.error)
      }
    })
    // listen for webview loaded
    this.webview.onPageLoaded(() => {
      if (!this.webviewIndexLoaded) {
        this.webviewIndexLoaded = true
        this.webview.checkForUpdates(60)
      }
    })
    // listen for webview update
    this.webview.onUpdate(async (body: { appId: string, oldVersion: string, newVersion: string }) => {
      this.zone.run(() => {
        this.webviewLoading = true
        this.presentAlertUpdate(body.appId)
      })
    })

    this.showLoading()
  }

  ngAfterViewInit () {
    this.createWebview()
  }

  ngOnDestroy () {
    this.resumeSub.remove()
  }

  private async showLoading (): Promise<void> {
    if (!this.loader) {
      this.loader = await this.loadingCtrl.create({
        spinner: 'lines',
        cssClass: 'loader',
        message: 'Loading Cups',
      })
      await this.loader.present()
    }

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
      this.zone.run(() => {
        this.webviewLoading = false
        this.dismissLoader()
        this.cancelable = null
      })
    }).catch((e) => {
      console.error(e)
    })
  }

  private async createWebview (): Promise<void> {
    this.webview.open({
      url: `onion://${this.store.peekTorAddress()}`,
      element: this.webviewEl.nativeElement,
      torproxy: {
        protocol: 'SOCKS',
        host: '127.0.0.1',
        port: TorService.PORT,
      },
      torTimeout: 60,
      rpchandler: (_host: string, method: string, data: any) => {
        switch (method) {
          case '/childReady':
            this.handleChildReady()
            break
          case '/getConfigValue':
            return this.getConfigValue(data[0])
          case '/close':
            this.close()
            break
          default:
            throw new Error('unimplemented')
        }
      },
    })
  }

  private async handleChildReady (): Promise<void> {
    this.zone.run(() => {
      if (this.cancelable) {
        this.cancelable.reject()
      }
      this.webviewLoading = false
      // dragons
      setTimeout(() => { this.dismissLoader() }, 500)
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
    this.zone.run(() => { this.navCtrl.navigateRoot(['/home']) })
    this.webview.close()
    this.webview = undefined
  }

  private async dismissLoader (): Promise<void> {
    if (this.loader) {
      this.loader.dismiss()
      this.loader = undefined
    }
  }

  async presentAlertUpdate (appId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Update Detected',
      message: 'Cups will now synchronize with Embassy Mod.',
      buttons: [
        {
          role: 'cancel',
          text: 'OK',
          handler: () => {
            this.reloadWebview(appId)
          },
        },
      ],
    })
    await alert.present()
  }

  private async reloadWebview (appId: string): Promise<void> {
    this.showLoading()
    await this.webview.clearCache(appId, '*')
    await this.webview.loadUrl(`onion://${this.store.peekTorAddress()}`)
  }
}
