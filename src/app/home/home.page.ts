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

  constructor(
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
    private readonly loadingCtrl: LoadingController,
  ) { }

  async connect() {
    const loader = await this.loadingCtrl.create({
      message: 'Connecting to Server...',
      spinner: 'lines',
      cssClass: 'loader',
    })
    await loader.present()

    // const path = await this.httpService.request({
    //   verb: HttpVerb.GET,
    //   host: '<address>.onion',
    //   port: 5959,
    //   path: '/version',
    // })
    const path = 'https://fr.wikipedia.org/wiki/Main_Page'
    this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(path)

    await loader.dismiss()

    setTimeout(() => this.closeFrame(), 2000)
  }

  closeFrame() {
    this.iFrame = undefined
  }
}
