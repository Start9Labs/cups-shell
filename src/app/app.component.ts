import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'

import { Plugins } from '@capacitor/core'
import { HttpService } from './http-service'
const { SplashScreen } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor (
    private platform: Platform,
    private httpService: HttpService,
  ) {
    this.initializeApp()
  }

  initializeApp () {
    this.platform.ready().then(async () => {
      // init Tor process
      await this.httpService.initTor()
      // dismiss splash screen
      setTimeout(() => {
        SplashScreen.hide()
      }, 300)
    })
  }
}
