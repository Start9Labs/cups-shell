import { Component, NgZone } from '@angular/core'
import { LoadingController, NavController, ActionSheetController, Platform, AlertController } from '@ionic/angular'
import { WebviewPluginNative } from 'capacitor-s9-webview'
import { HttpService } from 'src/app/services/http.service'
import { Store } from 'src/app/store'
import { TorService, TorConnection } from 'src/app/services/tor.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private readonly torLoadingMessage = 'Establishing Tor Circuit'
  torAddressSub: Subscription
  connectionSub: Subscription
  progressSub: Subscription
  torAddressInput = ''
  passwordInput = ''
  error = ''
  loader: HTMLIonLoadingElement

  constructor (
    public platform: Platform,
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController,
    private readonly loadingCtrl: LoadingController,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly httpService: HttpService,
    private readonly torService: TorService,
    private readonly store: Store,
    private readonly zone: NgZone,
  ) { }

  ngOnInit () {
    this.torAddressSub = this.store.watchTorAddress().subscribe(torAddress => {
      this.zone.run(() => { this.torAddressInput = torAddress })
    })
  }

  ngOnDestroy () {
    this.torAddressSub.unsubscribe()

    if (this.connectionSub) {
      this.connectionSub.unsubscribe()
      this.connectionSub = undefined
    }
    if (this.progressSub) {
      this.progressSub.unsubscribe()
      this.progressSub = undefined
    }
  }

  async login (): Promise<void> {
    // sanitize inputs
    this.torAddressInput = this.torAddressInput.trim()
    this.passwordInput = this.passwordInput.trim()
    // validate inputs
    if (!this.torAddressInput.endsWith('.onion') && !this.torAddressInput.endsWith('.onion/')) {
      this.error = 'Cups Tor Address must be a ".onion" URL'
      return
    }

    this.error = ''

    if (this.torService.peakConnection() === TorConnection.uninitialized) {
      this.torService.init()
    }

    const progress = this.torService.peakProgress()
    if (progress < 100) {
      this.loader = await this.loadingCtrl.create({
        spinner: 'lines',
        cssClass: 'loader',
        message: `${this.torLoadingMessage} ${progress}%`,
      })
      await this.loader.present()

      this.connectionSub = this.connectionSub || this.torService.watchConnection().subscribe(c => {
        if (c === TorConnection.failed) {
          this.dismissLoader()
          this.presentAlertFailed()
        }
      })
      this.progressSub = this.progressSub || this.torService.watchProgress().subscribe(p => {
        this.handleConnecting(p)
      })
    } else {
      this.authenticate()
    }
  }

  private async handleConnecting (progress: number): Promise<void> {
    this.loader.message = `${this.torLoadingMessage} ${progress}%`
    if (progress === 100) {
      this.authenticate()
    }
  }

  private async authenticate (): Promise<void> {
    // remove http/https
    if (this.torAddressInput.startsWith('http://')) {
      this.torAddressInput = this.torAddressInput.substr(7)
    }
    if (this.torAddressInput.startsWith('https://')) {
      this.torAddressInput = this.torAddressInput.substr(8)
    }

    const message = 'Authenticating'
    if (!this.loader) {
      this.loader = await this.loadingCtrl.create({
        spinner: 'lines',
        cssClass: 'loader',
        message,
      })
      await this.loader.present()
    } else {
      this.loader.message = message
    }

    try {
      // authenticate
      await this.httpService.torRequest<void>({
        method: 'GET',
        url: `http://${this.torAddressInput}/api`,
        params: { type: 'login' },
        headers: { Authorization: 'Basic ' + btoa(`me:${this.passwordInput}`) },
      })
      // save creds
      await this.store.saveCreds(this.torAddressInput, this.passwordInput)
      // nav
      this.zone.run(() => {
        this.navCtrl.navigateRoot(['/webview'])
      })
    } catch (e) {
      console.error(e)
      if (e.status === 401) {
        this.error = 'Invalid password'
      } else {
        this.error = 'Server not found'
      }
      return
    } finally {
      await this.dismissLoader()
    }
  }

  async presentAction (): Promise < void > {
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

  private async dismissLoader (): Promise<void> {
    await this.loader.dismiss()
    this.loader = undefined
  }

  private async presentAlertFailed (): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Connection Failed',
      message: 'Tor failed to connect. Please restart Cups to try again.',
      buttons: ['OK'],
    })
    await alert.present()
  }
}
