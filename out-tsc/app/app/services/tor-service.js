import { __awaiter, __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { TorClient } from 'capacitor-tor-client';
import { BehaviorSubject } from 'rxjs';
let TorService = class TorService {
    constructor() {
        this.torClient = new TorClient();
        this.progress$ = new BehaviorSubject(0);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.torClient.initTor().subscribe(progress => {
            //   this.progress$.next(progress)
            //   if (progress === 1) { this.progress$.complete() }
            // })
            this.torClient.initTor();
            setTimeout(() => { this.progress$.next(.25); }, 1500);
            setTimeout(() => { this.progress$.next(.4); }, 2000);
            setTimeout(() => { this.progress$.next(.6); }, 3000);
            setTimeout(() => { this.progress$.next(.9); }, 4500);
            setTimeout(() => { this.progress$.next(1); this.progress$.complete(); }, 5500);
        });
    }
};
TorService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], TorService);
export { TorService };
//# sourceMappingURL=tor-service.js.map