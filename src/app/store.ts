import { Injectable } from '@angular/core'

import { Plugins } from '@capacitor/core'
const { Storage, SecureStoragePlugin: SecureStorage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class Store {
  platformReady = true
  torAddress = ''
  password = ''

  async init (): Promise<void> {
    /**
     * Detect if this is the first launch of the app.
     * If so, delete data from the secure element.
     * We do this b/c iOS does not purge the app Keychain on uninstal.
     */
    const initializedKey = 'initialized'
    const initialized = (await Storage.get({ key: initializedKey })).value
    if (!initialized) {
      await SecureStorage.clear()
      await Storage.set({ key: initializedKey, value: String(true) })
    } else {
      try {
        this.torAddress = (await SecureStorage.get({ key: 'torAddress' })).value
      } catch (e) { }

      try {
        this.password = (await SecureStorage.get({ key: 'password' })).value
      } catch (e) { }
    }
  }

  async saveCreds (torAddress: string, password: string): Promise<void> {
    await Promise.all([
      SecureStorage.set({ key: 'torAddress', value: torAddress }),
      SecureStorage.set({ key: 'password', value: password }),
    ])
    this.torAddress = torAddress
    this.password = password
  }

  async removePassword (): Promise<void> {
    await SecureStorage.remove({ key: 'password' })
    this.password = ''
  }
}