"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
