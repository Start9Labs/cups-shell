import { Component } from '@angular/core'
import { LoadingController, AlertController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ProxyService } from '../../services/proxy-service'
import { BackgroundService } from 'src/app/services/background-service'
import { Store } from 'src/app/store'
import { HttpService } from 'src/app/services/http-service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  torAddress = ''
  password = ''
  showForm = false
  iFrame: SafeResourceUrl

  constructor (
    private readonly sanitizer: DomSanitizer,
    private readonly httpService: HttpService,
    private readonly proxyService: ProxyService,
    private readonly backgroundService: BackgroundService,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly store: Store,
  ) { }

  ngOnInit () {
    this.torAddress = this.store.torAddress
    this.password = this.store.password
    if (this.torAddress && this.password) {
      this.renderFrame()
    } else {
      this.showForm = true
    }
  }

  async connect (): Promise<void> {
    const loader = await this.loadingCtrl.create({
      message: 'Authenticating...',
    })
    await loader.present()

    try {
      // authenticate
      await this.httpService.exactRequest({
        method: 'POST',
        url: `http://${this.torAddress}/authenticate`,
        data: { password: this.password },
        proxy: {
          host: 'localhost',
          port: 59590,
          protocol: 'SOCKS',
        },
      })
      // save creds
      await this.store.saveCreds(this.torAddress, this.password)
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

    await this.renderFrame()
  }

  async renderFrame (): Promise<void> {
    // init webserver proxy
    const port = await this.proxyService.init()
    // create iFrame
    this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:${port}`)
    // this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(`http://example.com`)
    // add background listener
    this.backgroundService.listenForNotifications()

    // setTimeout(() => this.closeFrame('invalid auth'), 4000)
  }

  async closeFrame (message?: string): Promise<void> {
    this.store.removePassword()
    this.password = ''
    this.showForm = true
    this.iFrame = undefined

    if (message) {
      const alert = await this.alertCtrl.create({
        header: 'Disconnected',
        message,
        buttons: ['OK'],
        cssClass: 'alert-danger',
      })
      await alert.present()
    }
  }
}
