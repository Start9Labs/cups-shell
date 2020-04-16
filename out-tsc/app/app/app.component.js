import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { Store } from './store';
import { TorService } from './services/tor-service';
import { Plugins } from '@capacitor/core';
const { SplashScreen } = Plugins;
let AppComponent = class AppComponent {
    constructor(store, torService) {
        this.store = store;
        this.torService = torService;
        this.initializeApp();
    }
    initializeApp() {
        return __awaiter(this, void 0, void 0, function* () {
            // init Tor
            this.torService.init();
            // init store
            yield this.store.init();
            // dismiss splash screen
            yield SplashScreen.hide();
        });
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: 'app.component.html',
        styleUrls: ['app.component.scss'],
    }),
    __metadata("design:paramtypes", [Store,
        TorService])
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map