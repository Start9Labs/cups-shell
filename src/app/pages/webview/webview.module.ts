import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { WebviewPage } from './webview.page'

const routes: Routes = [
  {
    path: '',
    component: WebviewPage,
  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [WebviewPage],
})
export class WebviewPageModule { }
