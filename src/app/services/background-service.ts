import { Injectable } from '@angular/core'
import { HttpService, Method } from './http-service'
import { Store } from '../store'

import { Plugins } from '@capacitor/core'
const { BackgroundTask, LocalNotifications } = Plugins

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  constructor (
    private readonly httpService: HttpService,
    private readonly store: Store,
  ) { }

  async listenForNotifications (): Promise<void> {
    // should not be beforeExit(). Need to augment plugin: https://github.com/ionic-team/capacitor/issues/69
    BackgroundTask.beforeExit(async () => {
      const res = await this.httpService.request<{ messages: string[] }>(`http://${this.store.torAddress}.onion`, {
        method: Method.get,
      })

      const quantity = res.messages.length

      if (!quantity) { return }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'New Message',
            body: `You have ${quantity} new messages.`,
          },
        ],
      })
    })
  }
}
