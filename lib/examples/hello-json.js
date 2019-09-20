"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const utils_1 = require("../streams/utils");
const duplex_stream_1 = require("../transports/duplex-stream");
function remoteSum(a, b, cb) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = utils_1.simpleCrossStream();
        const localStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.a, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport);
        const remoteStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.b, undefined, 'remote');
        const remoteApi = new api_1.Api({
            remoteSum,
        }, remoteStreamTransport);
        localApi.callMethod('remoteSum', 10, 20, result => {
            console.log('answer:', result);
        });
    });
})();
