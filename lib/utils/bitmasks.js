"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitmaskMap = void 0;
function bitmaskMap(flags, startingBitIndex = 0) {
    const x = flags.reduce((sum, flag, flagIndex) => {
        const bitmask = 1 << (startingBitIndex + flagIndex);
        return Object.assign(sum, {
            [flag]: bitmask
        });
    }, {});
    return x;
}
exports.bitmaskMap = bitmaskMap;
