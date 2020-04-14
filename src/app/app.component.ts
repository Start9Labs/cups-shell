import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'

import { Plugins, LocalNotifications } from '@capacitor/core'
import { HttpService } from './http-service'
import { HttpVerb } from 'capacitor-tor-client'
const { SplashScreen, BackgroundTask } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private httpService: HttpService,
  ) {
    this.initializeApp()
  }

  initializeApp(): void {
    this.platform.ready().then(async () => {
      // init Tor process
      await this.httpService.initTor()
      // add background listener for new messages (https://github.com/ionic-team/capacitor/issues/69)
      // await BackgroundTask.background(() => {
      //   this.listenForNotifications()
      // })
      // dismiss splash screen
      setTimeout(() => {
        SplashScreen.hide()
      }, 300)


    })
  }

  async listenForNotifications(): Promise<void> {
    const messages = await this.httpService.request({
      verb: HttpVerb.GET,
      host: '<address>.onion',
      path: '/notifications',
      port: 5959,
    })

    const quantity = messages.length

    if (!quantity) { return }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'New Message',
          body: `You have ${quantity} new messages.`,
        },
      ],
    })
  }
}
