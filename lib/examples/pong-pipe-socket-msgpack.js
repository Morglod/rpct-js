"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const net = __importStar(require("net"));
const path = __importStar(require("path"));
const api_1 = require("../api");
const stream_1 = require("../transports/stream");
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
        const localStreamTransport = new stream_1.StreamTransport(readable, writable, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport, {
            debugName: 'local'
        });
        localApi.callMethod('ping', (pong) => {
            pong((str) => __awaiter(this, void 0, void 0, function* () {
                return str + ' world';
            }));
        });
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
        const remoteStreamTransport = new stream_1.StreamTransport(readable, writable, undefined, 'remote');
        const remoteApi = new api_1.Api({
            ping(pong) {
                pong((ping2) => __awaiter(this, void 0, void 0, function* () {
                    const r = ping2('hello');
                    console.log(yield r);
                }));
            }
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
