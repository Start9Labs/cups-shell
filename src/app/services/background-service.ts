import { Injectable } from '@angular/core'
import { HttpService } from './http-service'
import { Store } from '../store'

import { Plugins } from '@capacitor/core'
const { App, BackgroundTask, LocalNotifications } = Plugins

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  constructor (
    private readonly httpService: HttpService,
    private readonly store: Store,
  ) { }

  async listenForNotifications (): Promise<void> {
    App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        // should not be beforeExit(). Need to augment plugin: https://github.com/ionic-team/capacitor/issues/69
        const taskId = BackgroundTask.beforeExit(async () => {
          const res = await this.httpService.request<{ messages: string[] }>({
            method: 'GET',
            url: '/messages',
            headers: { Authorization: 'Basic ' + btoa(`me:${this.store.password}`) },
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

          BackgroundTask.finish({ taskId })
        })
      }
    })
  }
}
