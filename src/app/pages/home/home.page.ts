import { Component, NgZone } from '@angular/core'
import { LoadingController, AlertController, NavController } from '@ionic/angular'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { HttpService } from 'src/app/services/http-service'
import { Store } from 'src/app/store'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  torAddressInput = ''
  passwordInput = ''

  constructor (
    private readonly navCtrl: NavController,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly httpService: HttpService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    this.zone.run(() => {
      this.torAddressInput = this.store.torAddress
      this.passwordInput = this.store.password
    })
  }

  async connect (): Promise<void> {
    const loader = await this.loadingCtrl.create({
      message: 'Authenticating...',
      spinner: 'lines',
      cssClass: 'loader',
    })
    await loader.present()

    this.torAddressInput = this.torAddressInput.trim()
    this.passwordInput = this.passwordInput.trim()

    try {
      // authenticate
      // await this.httpService.torRequest({
      //   method: 'POST',
      //   url: `${this.torAddressInput}/authenticate`,
      //   data: { password: this.passwordInput },
      // })
      // save creds
      await this.store.saveCreds(this.torAddressInput, this.passwordInput)
    } catch (e) {
      const alert = await this.alertCtrl.create({
        header: 'Invalid Credentials',
        message: 'Invalid Tor address or password',
        buttons: ['OK'],
        cssClass: 'alert-danger',
      })
      await alert.present()
      return
    } finally {
      await loader.dismiss()
    }

    this.navCtrl.navigateRoot(['/webview'])
  }

  async clearCache (): Promise<void> {
    const loader = await this.loadingCtrl.create({
      message: 'Clearing Cache',
      spinner: 'lines',
      cssClass: 'loader',
    })
    await loader.present()
    await new WebviewPluginNative().clearCache('*', '*')
    await loader.dismiss()
  }
}
