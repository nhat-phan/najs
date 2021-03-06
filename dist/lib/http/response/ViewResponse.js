"use strict";
/// <reference path="../../contracts/HttpDriver.ts" />
/// <reference path="../../contracts/Response.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const najs_binding_1 = require("najs-binding");
const constants_1 = require("../../constants");
const lodash_1 = require("lodash");
class ViewResponse {
    constructor(view, variables) {
        this.view = view;
        this.variables = variables || {};
    }
    getClassName() {
        return constants_1.Najs.Http.Response.ViewResponse;
    }
    respond(request, response, driver) {
        return driver.respondView(response, this.view, this.variables);
    }
    with(name, value) {
        lodash_1.set(this.variables, name, value);
        return this;
    }
    getVariables() {
        return this.variables;
    }
}
ViewResponse.className = constants_1.Najs.Http.Response.ViewResponse;
exports.ViewResponse = ViewResponse;
najs_binding_1.register(ViewResponse, constants_1.Najs.Http.Response.ViewResponse);
