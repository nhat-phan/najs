"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const najs_binding_1 = require("najs-binding");
const najs_facade_1 = require("najs-facade");
const RequestDataWriter_1 = require("../request/RequestDataWriter");
const ExpressController_1 = require("../controller/ExpressController");
const lodash_1 = require("lodash");
class Session extends najs_facade_1.ContextualFacade {
    constructor(controller) {
        super(controller);
        controller.session = this;
        if (controller instanceof ExpressController_1.ExpressController) {
            this.data = controller.request.session;
            if (this.data && this.data[Session.FlashRegistryKey]) {
                this.data[Session.FlashRegistryKey].reflash = false;
                this.data[Session.FlashRegistryKey].keep = [];
                if (!this.data[Session.FlashRegistryKey].flash) {
                    this.data[Session.FlashRegistryKey].flash = [];
                }
            }
        }
    }
    getClassName() {
        return constants_1.ContextualFacadeClass.Session;
    }
    clear() {
        delete this.data;
        if (this.context instanceof ExpressController_1.ExpressController) {
            delete this.context.request.session;
        }
        return this;
    }
    async regenerate() {
        return new Promise(resolve => {
            if (this.context instanceof ExpressController_1.ExpressController) {
                return this.data['regenerate'](() => {
                    resolve();
                });
            }
            resolve();
        });
    }
    getFlashRegistry() {
        if (!this.data[Session.FlashRegistryKey]) {
            this.data[Session.FlashRegistryKey] = {
                reflash: false,
                flash: [],
                keep: []
            };
        }
        return this.data[Session.FlashRegistryKey];
    }
    flash(path, value) {
        const flashRegistry = this.getFlashRegistry();
        if (!flashRegistry.flash) {
            flashRegistry.flash = [];
        }
        if (flashRegistry.flash.indexOf(path) === -1) {
            flashRegistry.flash.push(path);
        }
        return this.set(path, value);
    }
    reflash() {
        const flashRegistry = this.getFlashRegistry();
        flashRegistry.reflash = true;
        return this;
    }
    keep(...args) {
        const paths = lodash_1.flatten(args);
        const flashRegistry = this.getFlashRegistry();
        if (!flashRegistry.keep) {
            flashRegistry.keep = [];
        }
        flashRegistry.keep = Array.from(new Set(flashRegistry.keep.concat(paths)));
        return this;
    }
    isFlashPath(path) {
        const flashRegistry = this.getFlashRegistry();
        if (flashRegistry.reflash) {
            return false;
        }
        if (flashRegistry.keep && flashRegistry.keep.indexOf(path) !== -1) {
            return false;
        }
        if (flashRegistry.flash && flashRegistry.flash.indexOf(path) === -1) {
            return false;
        }
        return true;
    }
    get(path, defaultValue) {
        if (this.isFlashPath(path)) {
            const value = RequestDataWriter_1.RequestDataWriter.prototype.get.apply(this, arguments);
            this.delete(path);
            const flashRegistry = this.getFlashRegistry();
            flashRegistry.flash = flashRegistry.flash.filter(item => item !== path);
            return value;
        }
        return RequestDataWriter_1.RequestDataWriter.prototype.get.apply(this, arguments);
    }
    has(path) {
        return RequestDataWriter_1.RequestDataWriter.prototype.has.apply(this, arguments);
    }
    exists(path) {
        return RequestDataWriter_1.RequestDataWriter.prototype.exists.apply(this, arguments);
    }
    all() {
        return RequestDataWriter_1.RequestDataWriter.prototype.all.apply(this, arguments);
    }
    only(...args) {
        return RequestDataWriter_1.RequestDataWriter.prototype.only.apply(this, arguments);
    }
    except(...args) {
        return RequestDataWriter_1.RequestDataWriter.prototype.except.apply(this, arguments);
    }
    set(path, value) {
        return RequestDataWriter_1.RequestDataWriter.prototype.set.apply(this, arguments);
    }
    put(path, value) {
        return this.set(path, value);
    }
    push(path, value) {
        return this.set(path, value);
    }
    pull(path, defaultValue) {
        return RequestDataWriter_1.RequestDataWriter.prototype.pull.apply(this, arguments);
    }
    delete(path) {
        return RequestDataWriter_1.RequestDataWriter.prototype.delete.apply(this, arguments);
    }
    remove(path) {
        return this.delete(path);
    }
    forget(path) {
        return this.delete(path);
    }
    flush() {
        return this.clear();
    }
}
Session.FlashRegistryKey = '_flashRegistry';
exports.Session = Session;
najs_binding_1.register(Session);
