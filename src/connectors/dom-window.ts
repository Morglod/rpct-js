import { ITransport } from '../transports/itransport';
import { createWindowWriteStream, createWindowReadStream } from '../streams/dom-window';
import { StreamTransport } from '../transports/stream';

export function connectToDOM(
    readFromWindow: Window,
    writeToWindow: Window,
): ITransport {
    const wstream = createWindowWriteStream(writeToWindow);
    const { stream: rstream, disposer } = createWindowReadStream(readFromWindow);
    return new StreamTransport(rstream, wstream);
}