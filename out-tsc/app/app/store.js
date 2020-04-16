import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
let Store = class Store {
    constructor() {
        this.authState$ = new BehaviorSubject(false);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.torAddress = (yield Storage.get({ key: 'torAddress' })).value;
            this.password = (yield Storage.get({ key: 'password' })).value;
        });
    }
    saveCreds(torAddress, password) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Storage.set({ key: 'torAddress', value: torAddress });
            yield Storage.set({ key: 'password', value: password });
            this.torAddress = torAddress;
            this.password = password;
        });
    }
};
Store = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __metadata("design:paramtypes", [])
], Store);
export { Store };
//# sourceMappingURL=store.js.map