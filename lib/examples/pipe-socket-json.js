"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const path = __importStar(require("path"));
const jsonStream = require('duplex-json-stream');
const api_1 = require("../api");
const duplex_json_stream_transport_1 = require("../duplex-json-stream.transport");
const stream_types_1 = require("../stream.types");
function remoteSum(a, b, cb) {
    console.log(`remoteSum(${a}, ${b}, cb)`);
    cb(a + b);
}
const WINDOWS = 0;
const SOCKET_PATH = WINDOWS ? path.join('\\\\?\\pipe', process.cwd(), 'myctl') : './test-socket';
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const srv = yield server();
        const conn = yield client();
    });
})();
function client() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const conn = net.connect(SOCKET_PATH, () => __awaiter(this, void 0, void 0, function* () {
                const chain = jsonStream(conn);
                const localStreamTransport = new duplex_json_stream_transport_1.DuplexJsonStreamTransport(stream_types_1.asDuplexStream(chain), undefined, 'local');
                const localApi = new api_1.Api({}, localStreamTransport);
                yield new Promise(rr => {
                    localApi.callMethod('remoteSum', 10, 20, result => {
                        console.log('answer:', result);
                        rr();
                    });
                });
                resolve(conn);
            })).on('error', err => {
                console.log('failed connect');
                console.error(err);
            });
            ;
        });
    });
}
function server() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const srv = net.createServer(socket => {
                const chain = jsonStream(socket);
                const remoteStreamTransport = new duplex_json_stream_transport_1.DuplexJsonStreamTransport(stream_types_1.asDuplexStream(chain), undefined, 'remote');
                const remoteApi = new api_1.Api({
                    remoteSum,
                }, remoteStreamTransport);
            }).listen(SOCKET_PATH, () => {
                console.log('server listening');
                resolve(srv);
            }).on('error', err => {
                console.log('failed createServer');
                console.error(err);
            });
        });
    });
}
