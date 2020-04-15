import { Component } from '@angular/core'

import { Plugins } from '@capacitor/core'
const { SplashScreen } = Plugins

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor () {
    // dismiss splash screen
    SplashScreen.hide()
  }
}
