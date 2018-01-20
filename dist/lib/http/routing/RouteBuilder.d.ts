import { HttpMethod } from './../HttpMethod';
import { IRouteBuilder } from './interfaces/IRouteBuilder';
import { IRouteData } from './interfaces/IRouteData';
import { RouteGrammarGroupChain, RouteGrammarVerbChain, RouteGrammarNameChain, RouteGrammarControlChain, IRouteGrammarControl, IRouteGrammarGroup, IRouteGrammarNamed, IRouteGrammarVerbs } from './interfaces/IRouteGrammars';
import { IMiddleware } from '../middleware/IMiddleware';
/**
 * Route syntax implementation
 */
export declare class RouteBuilder implements IRouteBuilder, IRouteGrammarControl, IRouteGrammarGroup, IRouteGrammarNamed, IRouteGrammarVerbs {
    protected data: IRouteData;
    protected children: Array<IRouteBuilder>;
    constructor();
    constructor(method: string, path: string);
    getRouteData(): IRouteData;
    registerChildRoute(route: IRouteBuilder): void;
    shouldRegisterChildRoute(): boolean;
    hasChildRoute(): boolean;
    use(middleware: IMiddleware): this;
    use(middleware: Function): this;
    use(middleware: string[]): this;
    use(middleware: IMiddleware[]): this;
    use(middleware: Function[]): this;
    use(...middleware: Array<string | string[] | IMiddleware | IMiddleware[] | Function | Function[]>): this;
    middleware(middleware: IMiddleware): this;
    middleware(middleware: Function): this;
    middleware(middleware: string[]): this;
    middleware(middleware: IMiddleware[]): this;
    middleware(middleware: Function[]): this;
    middleware(...middleware: Array<string | string[] | IMiddleware | IMiddleware[] | Function | Function[]>): this;
    prefix(prefix: string): RouteGrammarControlChain;
    group(callback: () => void): RouteGrammarGroupChain;
    name(name: string): RouteGrammarNameChain;
    checkout(path: string, target: string): RouteGrammarVerbChain;
    checkout(path: string, endpoint: Function): RouteGrammarVerbChain;
    checkout<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    copy(path: string, target: string): RouteGrammarVerbChain;
    copy(path: string, endpoint: Function): RouteGrammarVerbChain;
    copy<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    delete(path: string, target: string): RouteGrammarVerbChain;
    delete(path: string, endpoint: Function): RouteGrammarVerbChain;
    delete<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    get(path: string, target: string): RouteGrammarVerbChain;
    get(path: string, endpoint: Function): RouteGrammarVerbChain;
    get<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    head(path: string, target: string): RouteGrammarVerbChain;
    head(path: string, endpoint: Function): RouteGrammarVerbChain;
    head<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    lock(path: string, target: string): RouteGrammarVerbChain;
    lock(path: string, endpoint: Function): RouteGrammarVerbChain;
    lock<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    merge(path: string, target: string): RouteGrammarVerbChain;
    merge(path: string, endpoint: Function): RouteGrammarVerbChain;
    merge<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    mkactivity(path: string, target: string): RouteGrammarVerbChain;
    mkactivity(path: string, endpoint: Function): RouteGrammarVerbChain;
    mkactivity<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    mkcol(path: string, target: string): RouteGrammarVerbChain;
    mkcol(path: string, endpoint: Function): RouteGrammarVerbChain;
    mkcol<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    move(path: string, target: string): RouteGrammarVerbChain;
    move(path: string, endpoint: Function): RouteGrammarVerbChain;
    move<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    msearch(path: string, target: string): RouteGrammarVerbChain;
    msearch(path: string, endpoint: Function): RouteGrammarVerbChain;
    msearch<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    notify(path: string, target: string): RouteGrammarVerbChain;
    notify(path: string, endpoint: Function): RouteGrammarVerbChain;
    notify<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    options(path: string, target: string): RouteGrammarVerbChain;
    options(path: string, endpoint: Function): RouteGrammarVerbChain;
    options<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    patch(path: string, target: string): RouteGrammarVerbChain;
    patch(path: string, endpoint: Function): RouteGrammarVerbChain;
    patch<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    post(path: string, target: string): RouteGrammarVerbChain;
    post(path: string, endpoint: Function): RouteGrammarVerbChain;
    post<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    purge(path: string, target: string): RouteGrammarVerbChain;
    purge(path: string, endpoint: Function): RouteGrammarVerbChain;
    purge<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    put(path: string, target: string): RouteGrammarVerbChain;
    put(path: string, endpoint: Function): RouteGrammarVerbChain;
    put<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    report(path: string, target: string): RouteGrammarVerbChain;
    report(path: string, endpoint: Function): RouteGrammarVerbChain;
    report<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    search(path: string, target: string): RouteGrammarVerbChain;
    search(path: string, endpoint: Function): RouteGrammarVerbChain;
    search<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    subscribe(path: string, target: string): RouteGrammarVerbChain;
    subscribe(path: string, endpoint: Function): RouteGrammarVerbChain;
    subscribe<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    trace(path: string, target: string): RouteGrammarVerbChain;
    trace(path: string, endpoint: Function): RouteGrammarVerbChain;
    trace<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    unlock(path: string, target: string): RouteGrammarVerbChain;
    unlock(path: string, endpoint: Function): RouteGrammarVerbChain;
    unlock<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    unsubscribe(path: string, target: string): RouteGrammarVerbChain;
    unsubscribe(path: string, endpoint: Function): RouteGrammarVerbChain;
    unsubscribe<T extends Object>(path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
    method(method: HttpMethod, path: string, target: string): RouteGrammarVerbChain;
    method(method: HttpMethod, path: string, endpoint: Function): RouteGrammarVerbChain;
    method<T extends Object>(method: HttpMethod, path: string, controller: T, endpoint: keyof T): RouteGrammarVerbChain;
}
