import { Component, ElementRef, ViewChild, NgZone } from '@angular/core'
import { NavController } from '@ionic/angular'
// import { BackgroundService } from 'src/app/services/background-service'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { TorService } from 'src/app/services/tor-service'
import { Store } from 'src/app/store'

@Component({
  selector: 'app-webview',
  templateUrl: 'webview.page.html',
  styleUrls: ['webview.page.scss'],
})
export class WebviewPage {
  @ViewChild('webviewEl') webviewEl: ElementRef
  webview: WebviewPluginNative
  webviewLoading = false

  constructor (
    private readonly navCtrl: NavController,
    // private readonly backgroundService: BackgroundService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngAfterViewInit () {
    this.createWebview()
  }

  async createWebview (): Promise<void> {
    this.webview = new WebviewPluginNative()

    await this.webview.open({
      url: `onion://${this.store.torAddress}`,
      element: this.webviewEl.nativeElement,
      torproxy: {
        protocol: 'SOCKS',
        host: '127.0.0.1',
        port: TorService.PORT,
      },
      rpchandler: async (_host: string, method: string, data: any) => {
        switch (method) {
          case '/close':
            this.destroyWebview()
          case '/getConfigValue':
            if (data[0] === 'password') { return this.store.password }
          default:
            throw new Error('unimplemented')
        }
      },
    })

    // add background listener
    // this.backgroundService.addListener()

    this.webview.onPageLoaded(() => {
      console.log('page loaded')
    })

    this.webview.onProgress(progress => {
      console.log('progress', progress)
    })

    this.webview.handleNavigation(event => {
      if (event.newWindow) {
        event.complete(false)
        window.open(event.url)
      } else {
        event.complete(true)
      }
    })
  }

  async destroyWebview (): Promise<void> {
    // this.backgroundService.removeListener()
    await this.store.removePassword()
    this.webview.close()
    this.webview = undefined
    this.zone.run(() => { this.navCtrl.navigateRoot(['/home']) })
  }
}
