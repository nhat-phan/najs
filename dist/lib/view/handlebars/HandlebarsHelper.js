"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandlebarsHelper {
    constructor(context, controller) {
        this.context = context;
        this.controller = controller;
    }
    isBlockHelper() {
        return typeof this.options !== 'undefined' && typeof this.options.fn === 'function';
    }
    static create(helper, controller) {
        return function () {
            const options = arguments[arguments.length - 1];
            const instance = Reflect.construct(helper, [this, controller]);
            instance.options = options;
            return instance.run.apply(instance, arguments);
        };
    }
}
exports.HandlebarsHelper = HandlebarsHelper;