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
var jsonStream = require('duplex-json-stream');
var api_1 = require("../api");
var stream_transport_1 = require("../stream.transport");
var config_1 = require("../config");
var streams_1 = require("../streams");
function remoteSum(a, b, cb) {
    console.log("remoteSum(" + a + ", " + b + ", cb)");
    cb(a + b);
}
var socketPath = path.join('\\\\?\\pipe', process.cwd(), 'myctl');
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var srv, conn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config_1.DefaultConfig.debug = true;
                    config_1.DefaultConfig.uuidGeneratorFactory = function () { return function () { return Math.floor(Math.random() * 999).toString(16) + "-" + Math.floor(Math.random() * 999).toString(16) + "-" + Math.floor(Math.random() * 999).toString(16) + "-" + Math.floor(Math.random() * 999).toString(16); }; };
                    return [4 /*yield*/, server()];
                case 1:
                    srv = _a.sent();
                    return [4 /*yield*/, client()];
                case 2:
                    conn = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
})();
function client() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var conn = net.connect(socketPath, function () { return __awaiter(_this, void 0, void 0, function () {
                        var chain, localStreamTransport, localApi;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    chain = jsonStream(conn);
                                    localStreamTransport = new stream_transport_1.StreamIOTransport(streams_1.asDuplexStream(chain), undefined, 'local');
                                    localApi = new api_1.Api({}, localStreamTransport);
                                    return [4 /*yield*/, new Promise(function (rr) {
                                            localApi.callMethod('remoteSum', 10, 20, function (result) {
                                                console.log('answer:', result);
                                                rr();
                                            });
                                        })];
                                case 1:
                                    _a.sent();
                                    resolve(conn);
                                    return [2 /*return*/];
                            }
                        });
                    }); }).on('error', function (err) {
                        console.log('failed connect');
                        console.error(err);
                    });
                    ;
                })];
        });
    });
}
function server() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var srv = net.createServer(function (socket) {
                        var chain = jsonStream(socket);
                        var remoteStreamTransport = new stream_transport_1.StreamIOTransport(streams_1.asDuplexStream(chain), undefined, 'remote');
                        var remoteApi = new api_1.Api({
                            selfMethods: {
                                remoteSum: remoteSum,
                            }
                        }, remoteStreamTransport);
                    }).listen(socketPath, function () {
                        console.log('server listening');
                        resolve(srv);
                    }).on('error', function (err) {
                        console.log('failed createServer');
                        console.error(err);
                    });
                })];
        });
    });
}
