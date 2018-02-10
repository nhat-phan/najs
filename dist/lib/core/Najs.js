"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Application_1 = require("./Application");
const make_1 = require("./make");
const Path = require("path");
class NajsFramework {
    // config: IConfig
    // response: IResponse
    // logger: ILogger
    // schemaValidator: ISchemaValidator
    // cache: ICache
    constructor() {
        this.cwd = Path.resolve(__dirname, '..', '..', '..', '..');
        this.internalEventEmitter = new events_1.EventEmitter();
        this.serviceProviders = [];
        this.app = new Application_1.Application();
    }
    workingDirectory(cwd) {
        this.cwd = cwd;
        return this;
    }
    classes(...args) {
        for (const path of args) {
            require(Path.resolve(this.cwd, path));
        }
        return this;
    }
    providers(providers) {
        for (const name in providers) {
            const provider = this.resolveProvider(name);
            if (!provider) {
                continue;
            }
            this.serviceProviders.push(provider);
        }
        return this;
    }
    on(event, listener) {
        this.internalEventEmitter.on(event, listener);
        return this;
    }
    async start() {
        try {
            this.fireEventIfNeeded('start', this);
            await this.registerServiceProviders();
            await this.bootServiceProviders();
            this.fireEventIfNeeded('started', this);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(error) {
        if (this.fireEventIfNeeded('crash', error)) {
            return;
        }
        if (this.fireEventIfNeeded('crashed', error)) {
            return;
        }
        throw error;
    }
    resolveProvider(provider) {
        if (typeof provider === 'string') {
            return make_1.make(provider, [this.app]);
        }
        return Reflect.construct(provider, [this.app]);
    }
    async registerServiceProviders() {
        for (const provider of this.serviceProviders) {
            await provider.register();
            this.fireEventIfNeeded('registered', this, provider);
        }
    }
    async bootServiceProviders() {
        for (const provider of this.serviceProviders) {
            await provider.boot();
            this.fireEventIfNeeded('booted', this, provider);
        }
    }
    fireEventIfNeeded(event, ...args) {
        if (events_1.EventEmitter.listenerCount(this.internalEventEmitter, event) > 0) {
            this.internalEventEmitter.emit(event, ...args);
            return true;
        }
        return false;
    }
}
exports.Najs = new NajsFramework();