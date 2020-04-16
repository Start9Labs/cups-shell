import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TorService } from '../../services/tor-service';
let TorPage = class TorPage {
    constructor(navCtrl, torService) {
        this.navCtrl = navCtrl;
        this.torService = torService;
    }
    ngOnInit() {
        // init Tor
        this.torService.progress$.subscribe(progress => {
            if (progress === 1) {
                this.navCtrl.navigateRoot(['/home']);
            }
        });
    }
};
TorPage = __decorate([
    Component({
        selector: 'app-tor',
        templateUrl: 'tor.page.html',
        styleUrls: ['tor.page.scss'],
    }),
    __metadata("design:paramtypes", [NavController,
        TorService])
], TorPage);
export { TorPage };
//# sourceMappingURL=tor.page.js.map