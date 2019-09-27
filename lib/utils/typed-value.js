"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_options_1 = require("./object-options");
const typedValue = Symbol('typed value');
function toTypedValue(value, symbolType) {
    return object_options_1.setObjectOptions(value, typedValue, true);
}
exports.toTypedValue = toTypedValue;
function fromTypedValue(value, symbolType) {
    const isTyped = object_options_1.getObjectOptions(value, typedValue, false);
    if (!isTyped) {
        throw new Error('fromTypedValue for not typed value');
    }
    return value;
}
exports.fromTypedValue = fromTypedValue;
