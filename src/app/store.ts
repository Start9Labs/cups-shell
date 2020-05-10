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

  async init (): Promise<void> {
    const [torRes, passRes] = await Promise.all([
      Storage.get({ key: 'torAddress' }),
      Storage.get({ key: 'password' }),
    ])
    this.torAddress = torRes.value
    this.password = passRes.value
  }

  async saveCreds (torAddress: string, password: string): Promise<void> {
    await Promise.all([
      Storage.set({ key: 'torAddress', value: torAddress }),
      Storage.set({ key: 'password', value: password }),
    ])
    this.torAddress = torAddress
    this.password = password
  }

  async removePassword (): Promise<void> {
    await Storage.remove({ key: 'password' })
    this.password = ''
  }
}