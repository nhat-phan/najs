import { IAutoload } from 'najs-binding';
import { HandlebarsHelper } from '../HandlebarsHelper';
import { ExpressController } from '../../../http/controller/ExpressController';
export declare class RequestDataReaderHandlebarsHelper extends HandlebarsHelper<any, ExpressController> implements IAutoload {
    static className: string;
    protected property: string;
    constructor(context: any, controller: ExpressController, property?: string);
    getClassName(): string;
    run(command: string, ...args: any[]): undefined | boolean | string;
}
