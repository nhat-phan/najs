"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
require("../../event/EventDispatcher");
const najs_facade_1 = require("najs-facade");
const Najs_1 = require("../../core/Najs");
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const facade = najs_facade_1.Facade.create(Najs_1.Najs, 'event', function () {
    return najs_binding_1.make(constants_1.Najs.Event.EventDispatcher);
});
exports.Event = facade;
exports.EventFacade = facade;
