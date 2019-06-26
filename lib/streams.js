"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function simpleCrossStream() {
    var data = [];
    var duplex = require('stream').Duplex;
    return new duplex({
        write: function (chunk, enc, cb) {
            data.push(chunk);
            if (cb)
                cb();
        },
        read: function () {
            if (data.length === 0) {
                this.push(undefined);
                return;
            }
            var last = data[data.length - 1];
            data.pop();
            this.push(last);
        }
    });
}
exports.simpleCrossStream = simpleCrossStream;
