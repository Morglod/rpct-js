"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = __importStar(require("net"));
var path = __importStar(require("path"));
var api_1 = require("../api");
var stream_transport_1 = require("../stream.transport");
var message_pack_transform_1 = require("./message-pack-transform");
var SOCKET_PATH = path.join('\\\\?\\pipe', process.cwd(), 'myctl');
(function main() {
    // DefaultConfig.debug = true;
    server().once('listening', function () {
        client();
    });
})();
function client() {
    var _this = this;
    var conn = net.connect(SOCKET_PATH);
    conn.once('connect', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, encodeStream, decodeStream, readable, writable, localStreamTransport, localApi, word;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = message_pack_transform_1.messagePackTransforms(), encodeStream = _a.encodeStream, decodeStream = _a.decodeStream;
                    readable = conn.pipe(decodeStream);
                    writable = encodeStream;
                    writable.pipe(conn);
                    localStreamTransport = new stream_transport_1.StreamTransport(readable, writable, undefined, 'local');
                    localApi = new api_1.Api({}, localStreamTransport, undefined, 'local');
                    return [4 /*yield*/, localApi.callMethod('remoteSum', 10, 20, function (sumResult) {
                            console.log('sumResult:', sumResult);
                            return 'hell';
                        }, function (mulResult) {
                            console.log('mulResult:', mulResult);
                            return 'o w';
                        }, function (powResult) {
                            console.log('powResult:', powResult);
                            return 'orld';
                        })];
                case 1:
                    word = _b.sent();
                    console.log(word);
                    return [2 /*return*/];
            }
        });
    }); }).on('error', function (err) {
        console.log('failed connect');
        console.error(err);
    });
    return conn;
}
function server() {
    return net.createServer(function (socket) {
        var _a = message_pack_transform_1.messagePackTransforms(), encodeStream = _a.encodeStream, decodeStream = _a.decodeStream;
        var readable = socket.pipe(decodeStream);
        var writable = encodeStream;
        writable.pipe(socket);
        var remoteStreamTransport = new stream_transport_1.StreamTransport(readable, writable, undefined, 'remote');
        var remoteApi = new api_1.Api({
            selfMethods: {
                remoteSum: function (a, b, sum, mul, pow) {
                    return __awaiter(this, void 0, void 0, function () {
                        var word1, word2, word3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("remoteSum(" + a + ", " + b + ")");
                                    return [4 /*yield*/, sum(a + b)];
                                case 1:
                                    word1 = _a.sent();
                                    return [4 /*yield*/, mul(a * b)];
                                case 2:
                                    word2 = _a.sent();
                                    return [4 /*yield*/, pow(Math.pow(a, b))];
                                case 3:
                                    word3 = _a.sent();
                                    return [2 /*return*/, word1 + word2 + word3];
                            }
                        });
                    });
                },
            }
        }, remoteStreamTransport, undefined, 'remote');
    }).listen(SOCKET_PATH, function () {
        console.log('server listening');
    }).on('error', function (err) {
        console.log('failed createServer');
        console.error(err);
    });
}
