import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'
import { TorService } from '../../services/tor-service'

@Component({
  selector: 'app-tor',
  templateUrl: 'tor.page.html',
  styleUrls: ['tor.page.scss'],
})
export class TorPage {

  constructor (
    private navCtrl: NavController,
    public torService: TorService,
  ) { }

  ngOnInit () {
    // init Tor
    this.torService.progress$.subscribe(progress => {
      if (progress === 1) {
        this.navCtrl.navigateRoot(['/home'])
      }
    })
  }
}
