import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { WebServer } from '@ionic-native/web-server/ngx';
import BiMap from 'bimap';
import { HttpService } from './http-service';
import { Store } from '../store';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
let ProxyService = class ProxyService {
    constructor(httpService, store) {
        this.httpService = httpService;
        this.store = store;
        this.port = 8081;
        this.portMap = new BiMap();
        this.services = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let port = this.portMap.val(this.store.torAddress);
            console.log('** PORT **', port);
            if (port) {
                return port;
            }
            const server = new WebServer();
            port = this.port++;
            server.onRequest().subscribe(req => {
                this.handler(req)
                    .then(res => server.sendResponse(req.requestId, res)
                    .catch(console.error));
            });
            yield server.start(port); // hopefully this wont run forever
            this.portMap.push(port, this.store.torAddress);
            this.services[port] = server;
            return port;
        });
    }
    shutdown(portOrUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let service;
            // port
            if (typeof portOrUrl === 'number') {
                service = this.services[portOrUrl];
                // url
            }
            else {
                service = this.services[this.portMap.val(portOrUrl)];
            }
            // only stop if exists
            if (service) {
                yield service.stop();
            }
        });
    }
    handler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseUrl = this.store.torAddress;
            const storageKey = `cache:${baseUrl}:${req.path}`;
            const shouldCache = req.headers['Cache-Control'] !== 'no-store';
            if (shouldCache) {
                const cached = (yield Storage.get({ key: storageKey })).value;
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            console.log('** PROXY REQUEST **', req);
            const params = {};
            for (let [key, val] of req.query.split('&').map(seg => seg.split('='))) {
                params[key] = val;
            }
            const res = yield this.httpService.rawRequest({
                method: req.method,
                url: req.path,
                params,
                // data: req.body,
                headers: req.headers,
            }).catch(e => ({
                data: String(e),
                status: 500,
                headers: {},
            }));
            delete res.headers['Content-Encoding'];
            res.headers['Content-Length'] = String(res.data.length);
            res.headers['Cache-Control'] = 'no-store';
            const result = {
                status: res.status,
                body: res.data,
                headers: res.headers,
            };
            if (shouldCache && res.status >= 200 && res.status < 400) {
                yield Storage.set({
                    key: storageKey,
                    value: JSON.stringify(result),
                });
            }
            return result;
        });
    }
};
ProxyService = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __metadata("design:paramtypes", [HttpService,
        Store])
], ProxyService);
export { ProxyService };
//# sourceMappingURL=proxy-service.js.map