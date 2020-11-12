"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const utils_1 = require("../streams/utils");
const proxy_map_api_1 = require("../utils/proxy-map-api");
const duplex_stream_1 = require("../transports/duplex-stream");
const session = utils_1.simpleCrossStream();
(function server() {
    return __awaiter(this, void 0, void 0, function* () {
        function sum(a, b, sumCallback, mulCallback) {
            console.log(`remoteSum(${a}, ${b})`);
            sumCallback(a + b);
            mulCallback(a * b);
            mulCallback(a * b + 5);
            return 'hello world!';
        }
        const remoteStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.a, undefined, 'remote');
        const remoteApi = new api_1.Api({
            sum,
        }, remoteStreamTransport);
    });
})();
(function client() {
    return __awaiter(this, void 0, void 0, function* () {
        const localStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.b, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport);
        const api = proxy_map_api_1.proxyMapRemote(localApi);
        const result = yield api.sum(10, 20, sumResult => console.log('sum:', sumResult), mulResult => console.log('mul:', mulResult));
        console.log('result', result);
    });
})();
