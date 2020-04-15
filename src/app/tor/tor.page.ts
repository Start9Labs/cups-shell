import { Component } from '@angular/core'
import { HttpService } from '../http-service'
import { NavController } from '@ionic/angular'

@Component({
  selector: 'app-tor',
  templateUrl: 'tor.page.html',
  styleUrls: ['tor.page.scss'],
})
export class TorPage {
  progress = 0

  constructor (
    private navCtrl: NavController,
    private httpService: HttpService,
  ) { }

  ngOnInit () {
    // init Tor
    this.httpService.initTor().subscribe(async progress => {
      this.progress = progress / 100
      if (this.progress === 1) {
        await this.navCtrl.navigateRoot(['/home'])
      }
    })
  }
}
