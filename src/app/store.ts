import { Injectable } from '@angular/core'

import { Plugins } from '@capacitor/core'
const { SecureStoragePlugin: Storage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class Store {
  platformReady = true
  torAddress = ''
  password = ''

  async init (): Promise<void> {
    try {
      this.torAddress = (await Storage.get({ key: 'torAddress' })).value
    } catch (e) { }

    try {
      this.password = (await Storage.get({ key: 'password' })).value
    } catch (e) { }
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