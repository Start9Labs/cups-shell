import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Platform } from '@ionic/angular'
import { NetworkMonitor } from './services/network.service'
import { TorService } from './services/tor.service'
import { Store } from './store'

import { Plugins } from '@capacitor/core'
const { SplashScreen } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor (
    private readonly router: Router,
    private readonly platform: Platform,
    private readonly networkMonitor: NetworkMonitor,
    private readonly torService: TorService,
    private readonly store: Store,
  ) {
    // set dark theme
    document.body.classList.toggle('dark', true)
    this.initializeApp()
  }

  private async initializeApp () {
    // init store
    await this.store.init()
    // start services
    await this.startServices()
    // navigate
    await this.navigate()
    // subscribe to app pause event
    this.platform.pause.subscribe(() => {
      this.stopServices()
    })
    // sunscribe to app resume event
    this.platform.resume.subscribe(() => {
      this.startServices()
    })
    // dismiss splash screen
    SplashScreen.hide()
  }

  private async startServices (): Promise<void> {
    // init network monitor
    await this.networkMonitor.init()
    // init Tor
    this.torService.init()
  }

  private async stopServices (): Promise<void> {
    await this.torService.stop()
    this.networkMonitor.unint()
  }

  private async navigate () {
    let route: string
    if (this.store.torAddress && this.store.password) {
      route = '/webview'
    } else {
      route = '/home'
    }
    await this.router.navigate([route])
  }
}
