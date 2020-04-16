import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { Store } from '../store';
import { Plugins } from '@capacitor/core';
const { App, BackgroundTask, LocalNotifications } = Plugins;
let BackgroundService = class BackgroundService {
    constructor(httpService, store) {
        this.httpService = httpService;
        this.store = store;
    }
    listenForNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            App.addListener('appStateChange', (state) => {
                if (!state.isActive) {
                    // should not be beforeExit(). Need to augment plugin: https://github.com/ionic-team/capacitor/issues/69
                    const taskId = BackgroundTask.beforeExit(() => __awaiter(this, void 0, void 0, function* () {
                        const res = yield this.httpService.request({
                            method: 'GET',
                            url: '/messages',
                            headers: { Authorization: 'Basic ' + btoa(`me:${this.store.password}`) },
                        });
                        const quantity = res.messages.length;
                        if (!quantity) {
                            return;
                        }
                        yield LocalNotifications.schedule({
                            notifications: [
                                {
                                    id: 1,
                                    title: 'New Message',
                                    body: `You have ${quantity} new messages.`,
                                },
                            ],
                        });
                        BackgroundTask.finish({ taskId });
                    }));
                }
            });
        });
    }
};
BackgroundService = __decorate([
    Injectable({
        providedIn: 'root',
    }),
    __metadata("design:paramtypes", [HttpService,
        Store])
], BackgroundService);
export { BackgroundService };
//# sourceMappingURL=background-service.js.map