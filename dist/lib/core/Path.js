"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigFacade_1 = require("../facades/global/ConfigFacade");
const constants_1 = require("../constants");
const SystemPath = require("path");
const Najs_1 = require("./Najs");
class Path {
    constructor() {
        this.workingDirectory = Najs_1.Najs['cwd'] || '';
    }
    get(...args) {
        return SystemPath.resolve(this.workingDirectory, ...args);
    }
    cwd(...args) {
        return SystemPath.resolve(this.workingDirectory, ...args);
    }
    app(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.app, 'app'), ...args);
    }
    config(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.config, 'config'), ...args);
    }
    layout(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.layout, SystemPath.join('resources', 'view', 'layout')), ...args);
    }
    public(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.public, 'public'), ...args);
    }
    resource(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.resource, 'resources'), ...args);
    }
    route(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.route, 'routes'), ...args);
    }
    storage(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.storage, SystemPath.join('app', 'storage')), ...args);
    }
    view(...args) {
        return SystemPath.resolve(this.workingDirectory, ConfigFacade_1.ConfigFacade.get(constants_1.ConfigurationKeys.Paths.view, SystemPath.join('resources', 'view')), ...args);
    }
}
exports.Path = Path;