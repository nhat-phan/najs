"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const JsonpResponse_1 = require("../../../lib/http/response/JsonpResponse");
describe('JsonpResponse', function () {
    it('implements contract Najs.Contracts.Response with class name Najs.Http.Response.JsonpResponse', function () {
        const response = new JsonpResponse_1.JsonpResponse({});
        expect(response.getClassName()).toEqual('Najs.Http.Response.JsonpResponse');
    });
    it('can be created with any value', function () {
        const redirect = new JsonpResponse_1.JsonpResponse({ ok: true });
        expect(redirect['value']).toEqual({ ok: true });
    });
    it('calls IHttpDriver.respondJson and passes response, this.value', function () {
        const request = {};
        const response = {};
        const driver = { respondJsonp(response, url, status) { } };
        const respondJsonSpy = Sinon.spy(driver, 'respondJsonp');
        const redirect = new JsonpResponse_1.JsonpResponse('any');
        redirect.respond(request, response, driver);
        expect(respondJsonSpy.calledWith(response, 'any')).toBe(true);
    });
});
