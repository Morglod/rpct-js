[![NPM Version](https://badge.fury.io/js/rpct.svg?style=flat)](https://www.npmjs.com/package/rpct)

# rpct

RPC toolkit.

Goal: make simpliest for usage, zero-effort remote control library.

Api<Methods> -> Transport -> { ... session ... } -> Transport -> Api<Methods>

Api operates with messages.  
It can receive message and invoke local method.  
It can emit message and send to remote api to invoke remote method.  
It can pass callbacks as arguments.  
It raises up remote exceptions.  

Fully TypeScript'ed.

Api can be easily extended with [middlewares & hooks](./src/middlewares).

Transport operates with data serialization and deserialization. It resend messages over any session to remote connected Transport.

Browser minified sizes:  
* 17kb (without compression)
* 4kb (gzipped)

#### Example

Local:
```ts
let counter = 0;
setInterval(() => counter++, 1000);

function listenCounter(onChange) {
    watchProperty(() => counter).on('change', onChange);
}

// ...

new Api({
    listenCounter,
}, transport);
```

Remote:
```ts
// ...

api.listenCounter(bindCallback(counter => {
    console.log('counter', counter);
}));
```

## Some stats

json stream without callbacks:  
0.1ms per request
9600rps

json stream with callbacks:  
0.2ms per request
5000rps

## Usage

Install from npm:
```
npm i rpct
```

Pick browser minified version and use global `RPCT` object:
```html
<script src="https://unpkg.com/rpct/browser/rpct.min.js"></script>
```

Or import browser, lightweight version for bundling:
```ts
import * as rpct from 'rpct/browser';
```

[check out browser examples](./browser)

## Transports

as Transport may be implemented any environment, eg:

* Streams
* Socket.io
* DOM Window
* System sockets
* Figma UI-plugin
* WebSockets

[check out examples](./src/examples)

With stream trasport you can use any streamable format like [json](./src/examples/pipe-socket-json.ts) or [msgpack](./src/examples/pong-pipe-socket-msgpack.ts).

## Figma Plugin Example

Define "protocol":
```ts
interface PluginMethods {
    createRectangle(width: number, height: number): string;
}

interface UIMethods {}
```

In ui:
```ts
pluginApi = connectToPlugin<PluginMethods, UIMethods>({});

// invoke createRectangle(100, 50)
createdNodeId = await pluginApi.callMethod('createRectangle', 100, 50);
```

In plugin:
```ts
uiApi = connectToUI<PluginMethods, UIMethods>(figma, {
    createRectangle(width, height) {
        const rect = figma.createRectangle();
        rect.resize(width, height);
        figma.currentPage.appendChild(rect);
        return rect.id;
    }
});
```

You can use minified version from CDN (global `RPCT` object):
```html
<script src="https://unpkg.com/rpct/browser/rpct.min.js"></script>
```

## Window-Frame Example

Connect to frame, call remote `sum` method and pass numbers & callbacks.  
Remote method do sums and call remote callbacks.

Parent window script:
```js
var frame = document.getElementById('target');

var streamTransport = RPCT.connectToDOM(window, frame.contentWindow);
var api = RPCT.proxyMapRemote(new RPCT.Api({}, streamTransport));

api.sum(
    10, 20, // a, b
    sumResult => console.log('sum:', sumResult), // sumCallback
    mulResult => console.log('mul:', mulResult), // mulCallback
);
```

Inner frame script:
```js
var streamTransport = RPCT.connectToDOM(window, window.parent);

var remoteApi = new RPCT.Api({
    // api methods here
    sum(a, b, sumCallback, mulCallback) {
        console.log(`called sum(${a}, ${b})`);
        sumCallback(a + b);
        mulCallback(a * b);
    },
}, streamTransport);
```

## Watch remote counter?

In this code we call server's `listenCounter` method, pass client's callback for `onChange` event.  
Then client will print `counter 0, 1, 2, 3...`.

This is [fully working example](./src/examples/watch-changes.ts).

```ts
// Open local session for testing
const session = simpleCrossStream<ITransportProtocol>();

type ApiSchema = {
    listenCounter(
        onChange: (x: number) => void,
    ): void;
};

(async function server() {
    // counter
    let counter = 0;
    setInterval(() => counter++, 1000);

    function listenCounter(onChange: (x: number) => void) {
        watchProperty(() => counter).on('change', onChange);
    }

    const remoteStreamTransport = new DuplexStreamTransport(session.a, undefined, 'remote');
    const remoteApi = new Api<{}, ApiSchema>({
        listenCounter,
    }, remoteStreamTransport);
})();

(async function client() {
    const localStreamTransport = new DuplexStreamTransport(session.b, undefined, 'local');
    const localApi = new Api<ApiSchema, {}>({}, localStreamTransport);
    const api = proxyMapRemote(localApi);

    api.listenCounter(bindCallback(counter => {
        console.log('counter', counter);
    }));
})();

```