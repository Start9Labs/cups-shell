import { Component } from '@angular/core'
import { LoadingController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ProxyService } from '../../services/proxy-service'
import { BackgroundService } from 'src/app/services/background-service'
import { Store } from 'src/app/store'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  torAddress = ''
  password = ''
  iFrame: SafeResourceUrl

  constructor (
    private readonly sanitizer: DomSanitizer,
    private readonly proxyService: ProxyService,
    private readonly backgroundService: BackgroundService,
    private readonly loadingCtrl: LoadingController,
    private readonly store: Store,
  ) { }

  async connect () {
    const loader = await this.loadingCtrl.create({
      message: 'Connecting to Server...',
    })
    await loader.present()

    // save creds
    await this.store.saveCreds(this.torAddress, this.password)
    // init webserver proxy
    const port = await this.proxyService.init()
    // create iFrame
    this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:${port}`)
    // add background listener
    this.backgroundService.listenForNotifications()

    await loader.dismiss()
  }

  closeFrame () {
    this.iFrame = undefined
  }
}
