import { Component, ElementRef, ViewChild, NgZone } from '@angular/core'
import { NavController } from '@ionic/angular'
// import { BackgroundService } from 'src/app/services/background-service'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { TorService, TorConnection } from 'src/app/services/tor.service'
import { Store } from 'src/app/store'
import { Subscription } from 'rxjs'

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

  constructor (
    private readonly navCtrl: NavController,
    private readonly torService: TorService,
    // private readonly backgroundService: BackgroundService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    this.torSub = this.torService.watchConnection().subscribe(c => {
      this.zone.run(() => {
        if (c === TorConnection.in_progress) {
          this.torLoading = true
        } else if (c === TorConnection.connected) {
          this.torLoading = false
        }
      })
    })
  }

  ngOnDestroy () {
    this.torSub.unsubscribe()
  }

  ngAfterViewInit () {
    this.createWebview()
  }

  private async createWebview (): Promise<void> {
    this.webview = new WebviewPluginNative()

    this.webview.onPageLoaded(() => {
      this.zone.run(() => {
        // we give it an extra half second to display the page
        setTimeout(() => {
          this.webviewLoading = false
          // add background listener
          // this.backgroundService.addListener()
        }, 5000)
      })
    })

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
          case '/getConfigValue':
            this.getConfigValue(data[0])
          case '/close':
            this.close()
          case '/updateCache':
            this.updateCache()
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
    this.webview = undefined
    this.zone.run(() => { this.navCtrl.navigateRoot(['/home']) })
  }

  private async updateCache (): Promise<void> {
    this.webviewLoading = true

    this.webview.close()
    this.webview = undefined

    await new WebviewPluginNative().clearCache('*', '*')

    await this.createWebview()
  }
}
