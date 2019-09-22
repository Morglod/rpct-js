"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cloneJSON(x) {
    return JSON.parse(JSON.stringify(x));
}
exports.cloneJSON = cloneJSON;
function simpleCountGenerator(initial = 0) {
    let counter = initial;
    return () => {
        if (counter >= Number.MAX_SAFE_INTEGER - 5) {
            counter = 0;
        }
        counter++;
        return counter;
    };
}
exports.simpleCountGenerator = simpleCountGenerator;
function unsafeUUIDGenerator() {
    return () => {
        return `${Date.now()}-${Math.floor(Math.random() * 9999).toString(16)}-${Math.floor(Math.random() * 9999).toString(16)}`;
    };
}
exports.unsafeUUIDGenerator = unsafeUUIDGenerator;
