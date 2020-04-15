import { Component } from '@angular/core'
import { LoadingController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ProxyService } from '../services/proxy-service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  torAddress = ''
  iFrame: SafeResourceUrl

  constructor (
    private readonly sanitizer: DomSanitizer,
    private readonly proxyService: ProxyService,
    private readonly loadingCtrl: LoadingController,
  ) { }

  async connect () {
    const loader = await this.loadingCtrl.create({
      message: 'Connecting to Server...',
    })
    await loader.present()

    // init webserver proxy
    const port = await this.proxyService.init()
    // create iFrame
    this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:${port}`)
    // add background listener
    // this.httpService.listenForNotifications()

    await loader.dismiss()
  }

  closeFrame () {
    this.iFrame = undefined
  }
}
