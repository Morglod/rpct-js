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
const test_connections_1 = require("./test-connections");
const NUM_CALLS = 10000;
const SOCKET_PATH = './bench-socket-' + Date.now();
function remoteCall(a, b, c) {
    return c(a + b);
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { clientStream, serverConStream, } = yield test_connections_1.crossJsonSocket(SOCKET_PATH);
        // DefaultConfig.debug = true;
        const localApi = new api_1.Api({}, clientStream);
        const remoteApi = new api_1.Api({
            remoteCall,
        }, serverConStream);
        let bestTime = Number.MAX_SAFE_INTEGER;
        let worsTime = Number.MIN_SAFE_INTEGER;
        let totalMs = 0;
        for (let i = 0; i < NUM_CALLS; ++i) {
            const a = Math.random();
            const b = Math.random();
            const start = process.hrtime();
            const r = yield localApi.call('remoteCall', a, b, c => c);
            if (a + b !== r)
                throw new Error('bad result');
            const [, nanosecDiff] = process.hrtime(start);
            if (bestTime > nanosecDiff)
                bestTime = nanosecDiff;
            if (worsTime < nanosecDiff)
                worsTime = nanosecDiff;
            totalMs += nanosecDiff / 1000000;
        }
        const averageMs = totalMs / NUM_CALLS;
        console.log(`
        best time = ${bestTime / 1000000}ms
        worst time = ${worsTime / 1000000}ms
        average = ${totalMs / NUM_CALLS}ms
        average rps = ${1000 / averageMs}
    `);
        process.exit(0);
    });
})();
