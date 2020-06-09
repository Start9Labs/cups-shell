import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Router } from '@angular/router'
import { NetworkMonitor } from './services/network.service'
import { TorService, TorConnection } from './services/tor.service'
import { Store } from './store'

import { Plugins, StatusBarStyle, AppState } from '@capacitor/core'
const { App, SplashScreen, StatusBar } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor (
    private readonly platform: Platform,
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
    // init network monitor
    await this.networkMonitor.init()
    // navigate
    await this.navigate()
    // subscribe to pause/resume events
    App.addListener('appStateChange', async state => {
      this.handleStateChange(state)
    })
    // set StatusBar overlays webview (Android only)
    if (this.platform.is('android')) {
      StatusBar.setOverlaysWebView({ overlay: false })
    }
    // set StatusBar style
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
    // dismiss splash screen
    SplashScreen.hide()
  }

  private async navigate (): Promise<void> {
    let route: string
    if (this.store.peekTorAddress() && this.store.peekPassword()) {
      route = '/webview'
    } else {
      route = '/home'
    }
    this.router.navigate([route])
  }

  private async handleStateChange (state: AppState): Promise<void> {
    // app foregrounded
    if (state.isActive) {
      await this.networkMonitor.init()
      if (this.torService.peakConnection() !== TorConnection.uninitialized) {
        this.torService.init()
      }
    // app backgrounded
    } else {
      await this.torService.stop()
      this.networkMonitor.unint()
    }
  }
}
