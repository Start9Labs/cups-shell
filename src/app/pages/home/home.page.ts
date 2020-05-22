import { Component, NgZone } from '@angular/core'
import { LoadingController, NavController, ActionSheetController, Platform } from '@ionic/angular'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { HttpService } from 'src/app/services/http.service'
import { Store } from 'src/app/store'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  torAddressInput = ''
  passwordInput = ''
  error = ''

  constructor (
    public platform: Platform,
    private readonly navCtrl: NavController,
    private readonly loadingCtrl: LoadingController,
    private readonly actionSheetCtrl: ActionSheetController,
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

  async login (): Promise<void> {
    this.error = ''

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
      await this.httpService.torRequest({
        method: 'GET',
        url: `${this.torAddressInput}/api`,
        // @TODO switch to 'login' when available
        // params: { type: 'login' },
        params: { type: 'users' },
        headers: { Authorization: 'Basic ' + btoa(`me:${this.passwordInput}`) },
      })
      // save creds
      await this.store.saveCreds(this.torAddressInput, this.passwordInput)
      // nav
      await this.navCtrl.navigateRoot(['/webview'])
    } catch (e) {
      this.error = 'Invalid Credentials'
      return
    } finally {
      await loader.dismiss()
    }
  }

  async presentAction (): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [{
        text: 'Clear Cache',
        icon: 'trash-outline',
        cssClass: 'alert-danger',
        handler: () => {
          this.clearCache()
        },
      }],
    })
    await actionSheet.present()
  }

  private async clearCache (): Promise < void > {
    const loader = await this.loadingCtrl.create({
      message: 'Clearing Cache',
      spinner: 'lines',
      cssClass: 'loader',
    })
    await loader.present()

    try {
      await new WebviewPluginNative().clearCache('*', '*')
    } catch (e) {
      this.error = 'Failed to clear cache'
    } finally {
      await loader.dismiss()
    }
  }
}
