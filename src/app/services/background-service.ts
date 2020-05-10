import { Injectable } from '@angular/core'
import { HttpService } from './http-service'
import { Store } from '../store'

import { Plugins, PluginListenerHandle } from '@capacitor/core'
const { App, BackgroundTask, LocalNotifications } = Plugins

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private listener: PluginListenerHandle

  constructor (
    private readonly httpService: HttpService,
    private readonly store: Store,
  ) { }

  async addListener (): Promise<void> {
    if (this.listener) { return }

    this.listener = App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        // should not be beforeExit(). Need to augment plugin: https://github.com/ionic-team/capacitor/issues/69
        const taskId = BackgroundTask.beforeExit(async () => {
          const res = await this.httpService.torRequest<{ messages: string[] }>({
            method: 'GET',
            url: `${this.store.torAddress}/messages`,
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

  removeListener () {
    if (this.listener) {
      this.listener.remove()
      this.listener = undefined
    }
  }
}
