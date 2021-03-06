"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const Middleware = require("../../../../lib/http/middleware/built-ins/CorsMiddleware");
const ExpressMiddlewareBase_1 = require("../../../../lib/http/middleware/ExpressMiddlewareBase");
describe('CorsMiddleware', function () {
    it('extends ExpressMiddlewareBase', function () {
        const middleware = new Middleware.CorsMiddleware('test');
        expect(middleware).toBeInstanceOf(ExpressMiddlewareBase_1.ExpressMiddlewareBase);
    });
    it('implements IAutoload interface with class name "CorsMiddleware"', function () {
        expect(new Middleware.CorsMiddleware('cors').getClassName()).toEqual(Middleware.CorsMiddleware.className);
    });
    it('has shared Express.RequestHandler called CsurfProtection which not init by default', function () {
        expect(Middleware.CorsEnable).toBeUndefined();
    });
    describe('.createMiddleware()', function () {
        it('creates CsurfProtection from "csurf" module with {cookie: true} options when constructor called', function () {
            const getOptionsSpy = Sinon.spy(Middleware.CorsMiddleware.prototype, 'getOptions');
            const middleware = new Middleware.CorsMiddleware('cors');
            middleware.createMiddleware();
            expect(typeof Middleware.CorsEnable === 'function').toBe(true);
            expect(getOptionsSpy.called).toBe(true);
            getOptionsSpy.restore();
        });
        it('creates CsurfProtection only one time', function () {
            const getOptionsSpy = Sinon.spy(Middleware.CorsMiddleware.prototype, 'getOptions');
            const middleware = new Middleware.CorsMiddleware('cors');
            middleware.createMiddleware();
            expect(getOptionsSpy.called).toBe(false);
        });
    });
});
