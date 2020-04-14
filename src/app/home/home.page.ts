import { Component } from '@angular/core'
import { HttpService } from '../http-service'
import { LoadingController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { HttpVerb } from 'capacitor-tor-client'

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
      spinner: 'lines',
      cssClass: 'loader',
    })
    await loader.present()

    // init proxy
    const port = await this.httpService.initProxy(this.torAddress)
    console.log('** PORT **', port)
    // create iFrame path
    let iFrame = `http://localhost:${port}`
    this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(iFrame)
    console.log('** iFrame **', this.iFrame)

    await loader.dismiss()
  }

  closeFrame () {
    this.iFrame = undefined
  }
}
