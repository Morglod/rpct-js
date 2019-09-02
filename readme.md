# rpct

RPC toolkit.

Api<Methods> -> Transport -> { ... session ... } -> Transport -> Api<Methods>

Api operates with messages.  
It can receive message and invoke local method.  
It can emit message and send to remote api to invoke remote method.  
It can pass callbacks as arguments.  

Transport operates with data serialization and deserialization. It resend messages over any session to remote connected Transport.

Browser minified version - 13kb (without compression).

## Usage

RPCT is writed fully on TypeScript.

Install from npm:
```
npm i rpct
```

Pick browser minified version:
```
rpct/browser/rpct.min.js
```

[check out browser examples](./browser)

## Transports

as Transport may be implemented any environment, eg:

* Streams
* Socket.io
* DOM Window
* System sockets
<!-- * Figma plugin's data? -->

[check out examples](./src/examples)

With stream trasport you can use any streamable format like [json](./src/examples/pipe-socket-json.ts) or [msgpack](./src/examples/pong-pipe-socket-msgpack.ts).

## Window-Frame Example

Connect to frame, call remote `sum` method and pass numbers & callbacks.  
Remote method do sums and call remote callbacks.

Parent window script:
```js
var frame = document.getElementById('target');

var streamTransport = new RPCT.StreamTransport(
    RPCT.createWindowReadStream(window).stream,
    RPCT.createWindowWriteStream(frame.contentWindow),
);
var api = new RPCT.Api({}, streamTransport);

api.callMethod(
    'sum',    // Remote api method
    10,             // argument `a`
    20,             // argument `b`
    sumResult => console.log('sum:', sumResult),    // argument `sumCallback`
    mulResult => console.log('mul:', mulResult)     // argument `mulCallback`
);
```

Inner frame script:
```js
var streamTransport = new RPCT.StreamTransport(
    RPCT.createWindowReadStream(window).stream,
    RPCT.createWindowWriteStream(window.parent),
);

var remoteApi = new RPCT.Api({
    // api methods here
    sum(a, b, sumCallback, mulCallback) {
        console.log(`called sum(${a}, ${b})`);
        sumCallback(a + b);
        mulCallback(a * b);
    },
}, streamTransport);
```