"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hyperid_1 = __importDefault(require("hyperid"));
function cloneJSON(x) {
    return JSON.parse(JSON.stringify(x));
}
exports.cloneJSON = cloneJSON;
function simpleUUIDGenerator() {
    var counter = 0;
    return function () {
        if (counter >= Number.MAX_SAFE_INTEGER - 5) {
            counter = 0;
        }
        counter++;
        return counter;
    };
}
exports.simpleUUIDGenerator = simpleUUIDGenerator;
function hyperidUUIDGenerator() {
    var instance = hyperid_1.default({ fixedLength: true });
    return function () { return instance(); };
}
exports.hyperidUUIDGenerator = hyperidUUIDGenerator;
