import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ProxyService } from '../../services/proxy-service';
import { BackgroundService } from 'src/app/services/background-service';
import { Store } from 'src/app/store';
let HomePage = class HomePage {
    constructor(sanitizer, proxyService, backgroundService, loadingCtrl, store) {
        this.sanitizer = sanitizer;
        this.proxyService = proxyService;
        this.backgroundService = backgroundService;
        this.loadingCtrl = loadingCtrl;
        this.store = store;
        this.torAddress = '';
        this.password = '';
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const loader = yield this.loadingCtrl.create({
                message: 'Connecting to Server...',
            });
            yield loader.present();
            // save creds
            yield this.store.saveCreds(this.torAddress, this.password);
            // init webserver proxy
            const port = yield this.proxyService.init();
            // create iFrame
            this.iFrame = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:${port}`);
            // add background listener
            this.backgroundService.listenForNotifications();
            yield loader.dismiss();
        });
    }
    closeFrame() {
        this.iFrame = undefined;
    }
};
HomePage = __decorate([
    Component({
        selector: 'app-home',
        templateUrl: 'home.page.html',
        styleUrls: ['home.page.scss'],
    }),
    __metadata("design:paramtypes", [DomSanitizer,
        ProxyService,
        BackgroundService,
        LoadingController,
        Store])
], HomePage);
export { HomePage };
//# sourceMappingURL=home.page.js.map