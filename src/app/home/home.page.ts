import { Component } from '@angular/core'
import { HttpService } from '../http-service'
import { LoadingController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

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
    private readonly httpService: HttpService,
    private readonly loadingCtrl: LoadingController,
  ) { }

  async connect () {
    const loader = await this.loadingCtrl.create({
      message: 'Connecting to Server...',
    })
    await loader.present()

    // init webserver proxy
    const port = await this.httpService.initProxy(this.torAddress)
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
