import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

import { Plugins } from '@capacitor/core'
const { Storage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class Store {
  readonly authState$ = new BehaviorSubject<boolean>(false)
  torAddress = ''
  password = ''

  constructor () { }

  async init (): Promise<void> {
    this.torAddress = (await Storage.get({ key: 'torAddress' })).value
    this.password = (await Storage.get({ key: 'password' })).value
  }

  async saveCreds (torAddress: string, password: string): Promise<void> {
    await Storage.set({ key: 'torAddress', value: torAddress })
    await Storage.set({ key: 'password', value: password })
    this.torAddress = torAddress
    this.password = password
  }

  async removePassword (): Promise<void> {
    await Storage.remove({ key: 'password' })
    this.password = ''
  }
}