import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { NetworkMonitor } from './services/network.service'
import { TorService } from './services/tor.service'
import { Store } from './store'

import { Plugins, StatusBarStyle } from '@capacitor/core'
const { App, SplashScreen, StatusBar } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor (
    private readonly router: Router,
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
    // subscribe to pause/resume events
    App.addListener('appStateChange', async state => {
      if (state.isActive) {
        await this.startServices()
        this.store.platformReady = true
      } else {
        this.store.platformReady = false
        await this.stopServices()
      }
    })
    // set StatusBar overlays webview
    StatusBar.setOverlaysWebView({ overlay: false })
    // set StatusBar style
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
    // dismiss splash screen
    SplashScreen.hide()
  }

  private async startServices (): Promise<void> {
    await this.networkMonitor.init()
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
    this.router.navigate([route])
  }
}
