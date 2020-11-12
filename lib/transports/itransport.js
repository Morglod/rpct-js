"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransportProtocolApi = exports.isTransportProtocolReturnable = exports.transportProtocolToResponse = void 0;
function transportProtocolToResponse(protocol) {
    if ('exception' in protocol) {
        return { exception: protocol.exception };
    }
    else {
        return { return: protocol.return };
    }
}
exports.transportProtocolToResponse = transportProtocolToResponse;
function isTransportProtocolReturnable(protocol) {
    return ('exception' in protocol || 'return' in protocol);
}
exports.isTransportProtocolReturnable = isTransportProtocolReturnable;
function isTransportProtocolApi(protocol) {
    return ('api' in protocol);
}
exports.isTransportProtocolApi = isTransportProtocolApi;
