"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hyperid_1 = __importDefault(require("hyperid"));
function hyperidUUIDGenerator() {
    const instance = hyperid_1.default({ fixedLength: true });
    return () => instance();
}
exports.hyperidUUIDGenerator = hyperidUUIDGenerator;
