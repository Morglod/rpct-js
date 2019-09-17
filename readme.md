[![NPM Version](https://badge.fury.io/js/rpct.svg?style=flat)](https://www.npmjs.com/package/rpct)

# rpct

RPC toolkit.

Api<Methods> -> Transport -> { ... session ... } -> Transport -> Api<Methods>

Api operates with messages.  
It can receive message and invoke local method.  
It can emit message and send to remote api to invoke remote method.  
It can pass callbacks as arguments.  

Api can be easily extended with [middlewares & hooks]('./src/middlewares).

Transport operates with data serialization and deserialization. It resend messages over any session to remote connected Transport.

Browser minified sizes:  
* 17kb (without compression)
* 4kb (gzipped)

## Some stats

json stream without callbacks:  
0.1ms per request
9600rps

json stream with callbacks:  
0.2ms per request
5000rps

## Usage

RPCT is writed fully on TypeScript.

Install from npm:
```
npm i rpct
```

Pick browser minified version and use global `RPCT` object:
```html
<script src="https://unpkg.com/rpct/browser/rpct.min.js"></script>
```

[check out browser examples](./browser)

## Transports

as Transport may be implemented any environment, eg:

* Streams
* Socket.io
* DOM Window
* System sockets
* Figma UI-plugin

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
<script src="https://unpkg.com/rpct/browser/figma.min.js"></script>
```

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
