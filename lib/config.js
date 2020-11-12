"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfig = void 0;
const utils_1 = require("./utils/utils");
exports.DefaultConfig = {
    version: '0.1.0',
    debug: false,
    uuidGeneratorFactory: utils_1.unsafeUUIDGenerator,
};
