/// <reference types="express" />
import * as Express from 'express';
import { ExpressHttpDriver } from '../driver/ExpressHttpDriver';
import { IExpressMiddleware } from './IExpressMiddleware';
export declare class ExpressMiddlewareBase implements IExpressMiddleware {
    protected identify: string;
    protected name: string;
    protected isAppLevel: boolean;
    protected meta: string;
    constructor(name: string, level: string);
    protected parseParams(...args: any[]): void;
    protected parseLevel(level: string): void;
    createMiddleware(): Express.Handler | Express.Handler[] | undefined;
    native(driver: ExpressHttpDriver): Express.Handler | Express.Handler[] | undefined;
}