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
const api_1 = require("../api");
const stream_transport_1 = require("../stream.transport");
const message_pack_transform_1 = require("./message-pack-transform");
const WINDOWS = 0;
const SOCKET_PATH = WINDOWS ? path.join('\\\\?\\pipe', process.cwd(), 'myctl') : './test-socket';
(function main() {
    // DefaultConfig.debug = true;
    server().once('listening', () => {
        client();
    });
})();
function client() {
    const conn = net.connect(SOCKET_PATH);
    conn.once('connect', () => __awaiter(this, void 0, void 0, function* () {
        const { encodeStream, decodeStream } = message_pack_transform_1.messagePackTransforms();
        const readable = conn.pipe(decodeStream);
        const writable = encodeStream;
        writable.pipe(conn);
        const localStreamTransport = new stream_transport_1.StreamTransport(readable, writable, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport, {
            debugName: 'local'
        });
        const word = yield localApi.callMethod('remoteSum', 10, 20, sumResult => {
            console.log('sumResult:', sumResult);
            return 'hell';
        }, mulResult => {
            console.log('mulResult:', mulResult);
            return 'o w';
        }, powResult => {
            console.log('powResult:', powResult);
            return 'orld';
        });
        console.log(word);
    })).on('error', err => {
        console.log('failed connect');
        console.error(err);
    });
    return conn;
}
function server() {
    return net.createServer(socket => {
        const { encodeStream, decodeStream } = message_pack_transform_1.messagePackTransforms();
        const readable = socket.pipe(decodeStream);
        const writable = encodeStream;
        writable.pipe(socket);
        const remoteStreamTransport = new stream_transport_1.StreamTransport(readable, writable, undefined, 'remote');
        const remoteApi = new api_1.Api({
            remoteSum(a, b, sum, mul, pow) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`remoteSum(${a}, ${b})`);
                    const word1 = yield sum(a + b);
                    const word2 = yield mul(a * b);
                    const word3 = yield pow(Math.pow(a, b));
                    return word1 + word2 + word3;
                });
            },
        }, remoteStreamTransport, {
            debugName: 'remote'
        });
    }).listen(SOCKET_PATH, () => {
        console.log('server listening');
    }).on('error', err => {
        console.log('failed createServer');
        console.error(err);
    });
}
