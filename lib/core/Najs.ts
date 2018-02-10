import { INajs } from './INajs'
import { EventEmitter } from 'events'
import { IDispatcher } from '../event/IDispatcher'
import { IEventEmitter } from '../event/IEventEmitter'
import { IApplication } from './IApplication'
import { ServiceProvider } from './ServiceProvider'
import { Application } from './Application'
import { make } from './make'
import * as Path from 'path'

class NajsFramework implements INajs {
  private internalEventEmitter: EventEmitter
  protected cwd: string
  protected serviceProviders: ServiceProvider[]
  protected app: IApplication
  protected event: IEventEmitter & IDispatcher
  // config: IConfig
  // response: IResponse
  // logger: ILogger
  // schemaValidator: ISchemaValidator
  // cache: ICache

  constructor() {
    this.cwd = Path.resolve(__dirname, '..', '..', '..', '..')
    this.internalEventEmitter = new EventEmitter()
    this.serviceProviders = []
    this.app = new Application()
  }

  workingDirectory(cwd: string): this {
    this.cwd = cwd
    return this
  }

  classes(...args: string[]): this {
    for (const path of args) {
      require(Path.resolve(this.cwd, path))
    }
    return this
  }

  providers(providers: any[]): this {
    for (const name in providers) {
      const provider = this.resolveProvider(name)
      if (!provider) {
        continue
      }
      this.serviceProviders.push(provider)
    }
    return this
  }

  on(event: string, listener: any): this {
    this.internalEventEmitter.on(event, listener)
    return this
  }

  async start() {
    try {
      this.fireEventIfNeeded('start', this)
      await this.registerServiceProviders()
      await this.bootServiceProviders()
      this.fireEventIfNeeded('started', this)
    } catch (error) {
      this.handleError(error)
    }
  }

  protected handleError(error: any) {
    if (this.fireEventIfNeeded('crash', error)) {
      return
    }

    if (this.fireEventIfNeeded('crashed', error)) {
      return
    }

    throw error
  }

  protected resolveProvider(provider: string | typeof ServiceProvider): ServiceProvider | undefined {
    if (typeof provider === 'string') {
      return make<ServiceProvider>(provider, [this.app])
    }
    return Reflect.construct(provider, [this.app])
  }

  protected async registerServiceProviders() {
    for (const provider of this.serviceProviders) {
      await provider.register()
      this.fireEventIfNeeded('registered', this, provider)
    }
  }

  protected async bootServiceProviders() {
    for (const provider of this.serviceProviders) {
      await provider.boot()
      this.fireEventIfNeeded('booted', this, provider)
    }
  }

  protected fireEventIfNeeded(event: string, ...args: any[]): boolean {
    if (EventEmitter.listenerCount(this.internalEventEmitter, event) > 0) {
      this.internalEventEmitter.emit(event, ...args)
      return true
    }
    return false
  }
}

export const Najs: INajs = new NajsFramework()
