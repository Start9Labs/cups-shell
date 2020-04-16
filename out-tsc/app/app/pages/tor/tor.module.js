import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TorPage } from './tor.page';
const routes = [
    {
        path: '',
        component: TorPage,
    },
];
let TorPageModule = class TorPageModule {
};
TorPageModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            IonicModule,
            RouterModule.forChild(routes),
        ],
        declarations: [TorPage],
    })
], TorPageModule);
export { TorPageModule };
//# sourceMappingURL=tor.module.js.map