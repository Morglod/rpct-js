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
const proxy_map_api_1 = require("../utils/proxy-map-api");
const duplex_stream_1 = require("../transports/duplex-stream");
const watch_prop_1 = require("../utils/watch-prop");
const session = utils_1.simpleCrossStream();
(function server() {
    return __awaiter(this, void 0, void 0, function* () {
        // counter
        let counter = 0;
        setInterval(() => counter++, 1000);
        function listenCounter(onChange) {
            return new Promise(resolve => {
                watch_prop_1.watchProperty(() => counter).on('change', onChange);
            });
        }
        const remoteStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.a, undefined, 'remote');
        const remoteApi = new api_1.Api({
            listenCounter,
        }, remoteStreamTransport);
    });
})();
(function client() {
    return __awaiter(this, void 0, void 0, function* () {
        const localStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.b, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport);
        const api = proxy_map_api_1.proxyMapRemote(localApi);
        api.listenCounter(counter => {
            console.log('counter', counter);
        });
    });
})();
