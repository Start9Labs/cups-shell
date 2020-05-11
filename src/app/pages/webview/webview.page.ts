import { Component, ElementRef, ViewChild } from '@angular/core'
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
            // this.backgroundService.removeListener()
            this.store.removePassword()
            this.destroyWebview()
          case '/getConfigValue':
            if (data[0] === 'password') { return this.store.password }
          default:
            throw new Error('unimplemented')
        }
      },
      script: {
        javascript: `fetch('/api', { method: "POST", body: "BODE" }).then(res => res.json()).then(console.log).catch(console.error);`,
        injectionTime: 0,
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
    this.webview.close()
    this.webview = undefined
    await this.navCtrl.navigateRoot(['/home'])
  }
}
