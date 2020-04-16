import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import { Plugins } from '@capacitor/core'
const { Storage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class Store {
  readonly authState$ = new BehaviorSubject<boolean>(false)
  torAddress: string
  password: string

  constructor () { }

  async init () {
    this.torAddress = (await Storage.get({ key: 'torAddress' })).value
    this.password = (await Storage.get({ key: 'password' })).value
  }

  async saveCreds (torAddress: string, password: string) {
    await Storage.set({ key: 'torAddress', value: torAddress })
    await Storage.set({ key: 'password', value: password })
    this.torAddress = torAddress
    this.password = password
  }
}