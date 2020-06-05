import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { Plugins } from '@capacitor/core'
const { Storage, SecureStoragePlugin: SecureStorage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class Store {
  platformReady = true
  private readonly torAddress$ = new BehaviorSubject<string>('')
  private readonly password$ = new BehaviorSubject<string>('')
  watchTorAddress (): Observable<string> { return this.torAddress$.asObservable() }
  peekTorAddress (): string { return this.torAddress$.getValue() }
  peekPassword (): string { return this.password$.getValue() }

  async init (): Promise<void> {
    /**
     * Detect if this is the first launch of the app.
     * If so, delete data from the secure element.
     * We do this b/c iOS does not purge the app Keychain on uninstal.
     */
    const initializedKey = 'initialized'
    const initialized = (await Storage.get({ key: initializedKey })).value
    if (!initialized) {
      await SecureStorage.clear().catch(e => { })
      await Storage.set({ key: initializedKey, value: String(true) })
    } else {
      try {
        const torAddress = (await SecureStorage.get({ key: 'torAddress' })).value
        this.torAddress$.next(torAddress)
      } catch (e) { }

      try {
        const password = (await SecureStorage.get({ key: 'password' })).value
        this.password$.next(password)
      } catch (e) { }
    }
  }

  async saveCreds (torAddress: string, password: string): Promise<void> {
    await Promise.all([
      SecureStorage.set({ key: 'torAddress', value: torAddress }),
      SecureStorage.set({ key: 'password', value: password }),
    ])
    this.torAddress$.next(torAddress)
    this.password$.next(password)
  }

  async removePassword (): Promise<void> {
    await SecureStorage.remove({ key: 'password' })
    this.password$.next('')
  }
}