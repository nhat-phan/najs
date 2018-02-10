"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sinon = require("sinon");
function facade(arg) {
    // if (arg instanceof ContextualFacade) {
    // make a ContextualFacadeMatcher
    // }
    this.container = undefined;
    this.accessorKey = undefined;
    this.facadeInstanceCreator = undefined;
    this.createdSpies = {};
    this.createdStubs = {};
}
facade['create'] = function (container, key, facadeInstanceCreator) {
    if (typeof container[key] === 'undefined') {
        container[key] = facadeInstanceCreator();
    }
    container[key].container = container;
    container[key].accessorKey = key;
    container[key].facadeInstanceCreator = facadeInstanceCreator;
    return container[key];
};
facade.prototype = {
    spy(method) {
        const spy = Sinon.spy(this, method);
        this.createdSpies[method] = spy;
        return spy;
    },
    createStub(method) {
        const stub = Sinon.stub(this, method);
        this.createdStubs[method] = stub;
        return stub;
    },
    restoreFacade() {
        for (const method in this.createdSpies) {
            this.createdSpies[method].restore();
        }
        for (const method in this.createdStubs) {
            this.createdStubs[method].restore();
        }
    }
};
exports.Facade = facade;