import { Component } from '@angular/core'
import { Store } from './store'
import { TorService } from './services/tor-service'

import { Plugins } from '@capacitor/core'
import { Router } from '@angular/router'
const { SplashScreen } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor (
    private readonly store: Store,
    private readonly torService: TorService,
    private readonly router: Router,
  ) {
    this.initializeApp()
  }

  async initializeApp () {
    // init Tor
    this.torService.init()
    // init store
    await this.store.init()
    // dismiss splash screen
    SplashScreen.hide()
  }
}
