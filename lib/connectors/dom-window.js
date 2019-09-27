"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_window_1 = require("../streams/dom-window");
const stream_1 = require("../transports/stream");
function connectToDOM(readFromWindow, writeToWindow) {
    const wstream = dom_window_1.createWindowWriteStream(writeToWindow);
    const { stream: rstream, disposer } = dom_window_1.createWindowReadStream(readFromWindow);
    return new stream_1.StreamTransport(rstream, wstream);
}
exports.connectToDOM = connectToDOM;
