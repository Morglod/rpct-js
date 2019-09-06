"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const stream_transport_1 = require("./stream.transport");
const window_stream_1 = require("./window.stream");
const figma_utils_1 = require("./figma-utils");
const tsee_1 = require("tsee");
__export(require("./browser"));
__export(require("./figma-utils"));
function connectToPlugin(uiMethods) {
    const rstream = window_stream_1.createWindowReadStream(window, {
        unpack: evt => (evt.data).pluginMessage,
    }).stream;
    const wstream = window_stream_1.createWindowWriteStream(parent, {
        pack: (payload) => ({ pluginMessage: payload }),
    });
    const streamTransport = new stream_transport_1.StreamTransport(rstream, wstream, undefined, 'plugin ui');
    // connected api
    return new api_1.Api(uiMethods, streamTransport);
}
exports.connectToPlugin = connectToPlugin;
function connectToUI(figma, pluginMethods) {
    const wstream = new figma_utils_1.FigmaPluginWriteStream(figma);
    const rstream = new tsee_1.EventEmitter();
    figma.ui.onmessage = msg => {
        rstream.emit('data', msg);
    };
    const streamTransport = new stream_transport_1.StreamTransport(rstream, wstream, undefined, 'plugin back');
    const api = new api_1.Api(pluginMethods, streamTransport);
}
exports.connectToUI = connectToUI;
