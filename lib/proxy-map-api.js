"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function proxyMapRemote(api) {
    return new Proxy({}, {
        get(target, p, receiver) {
            return (...args) => api.call(p, ...args);
        }
    });
}
exports.proxyMapRemote = proxyMapRemote;
