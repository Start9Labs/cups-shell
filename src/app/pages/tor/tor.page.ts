import { Component, NgZone } from '@angular/core'
import { NavController } from '@ionic/angular'
import { TorService } from '../../services/tor-service'
import { Subscription } from 'rxjs'
import { Store } from 'src/app/store'

@Component({
  selector: 'app-tor',
  templateUrl: 'tor.page.html',
  styleUrls: ['tor.page.scss'],
})
export class TorPage {
  progressSub: Subscription
  progress = 0

  constructor (
    private readonly navCtrl: NavController,
    private readonly torService: TorService,
    private readonly zone: NgZone,
    private readonly store: Store,
  ) { }

  ngOnInit () {
    this.progressSub = this.torService.watchProgress().subscribe(p => {
      this.zone.run(() => {
        this.progress = p / 100
      })
      if (p === 100) { this.navigate() }
    })
  }

  private async navigate (): Promise<void> {
    await this.navCtrl.navigateRoot(['/home'])

    // if (this.store.password) {
    //   await this.navCtrl.navigateRoot(['/webview'])
    // } else {
    //   await this.navCtrl.navigateRoot(['/home'])
    // }
  }
}
