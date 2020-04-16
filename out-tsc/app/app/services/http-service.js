import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { HttpPluginNativeImpl } from 'capacitor-http';
import { Store } from '../store';
let HttpService = class HttpService {
    constructor(store) {
        this.store = store;
    }
    request(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.rawRequest(options);
            return res.data;
        });
    }
    rawRequest(options) {
        return __awaiter(this, void 0, void 0, function* () {
            options.url = `http://${this.store.torAddress}${options.url}`;
            options.proxy = {
                host: 'localhost',
                port: 59590,
                protocol: 'SOCKS',
            };
            console.log('** REQ **', options);
            const res = yield HttpPluginNativeImpl.request(options);
            console.log('** RES **', res);
            return res;
        });
    }
};
HttpService = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __metadata("design:paramtypes", [Store])
], HttpService);
export { HttpService };
//# sourceMappingURL=http-service.js.map