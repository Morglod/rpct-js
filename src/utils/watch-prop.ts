import { EventEmitter } from 'tsee';

const DEFAULT_POLL_INTERVAL = 300;
const defaultIsEqual = (a: any, b: any) => a === b;

type WatcherEvents<T> = {
    change: (newValue: T, oldValue?: T) => void;
    dispose: () => void;
};

export class Watcher<T> extends EventEmitter<WatcherEvents<T>> {
    constructor(propListenerDisposer?: () => void) {
        super();
        this._propListenerDisposer = propListenerDisposer;
    }

    private _propListenerDisposer?: () => void;

    get propListenerDisposer() {
        return this._propListenerDisposer;
    }

    lastValue: T|undefined;

    readonly emitChange = (newValue: T) => {
        const oldValue = this.lastValue;
        this.lastValue = newValue;
        this.emit('change', newValue, oldValue);
    };

    readonly setPropListenerDisposer = (disposer: Watcher<T>["_propListenerDisposer"]) => {
        this.disposePropListener();
        this._propListenerDisposer = disposer;
    };

    /** unbind all listeners from this watcher and bind to other */
    readonly rebindTo = (otherWatcher: Watcher<T>) => {
        const l = this.rawListeners('change');
        otherWatcher.rawListeners('change').push(
            ...l,
        );
        l.splice(0, l.length);
    };

    /** unbind all listeners from this watcher and bind to other and disposeEmitter */
    readonly rebindDisposePropListener = (otherWatcher: Watcher<T>) => {
        this.rebindTo(otherWatcher);
        this.disposePropListener();
    };

    readonly disposePropListener = () => {
        if (this.propListenerDisposer) {
            this.propListenerDisposer();
            this._propListenerDisposer = undefined;
        }
    };
}

export function watchProperty<Value>(
    getter: () => Value,
    opts: {
        pollInterval?: number,
        isEqual?: (oldV: Value, newV: Value) => boolean,
        watcher?: Watcher<Value>,
        /** true by default */
        emitOnStart?: boolean,
    } = {}
): Watcher<Value> {
    const {
        pollInterval = DEFAULT_POLL_INTERVAL,
        isEqual = defaultIsEqual,
        watcher = new Watcher<Value>(),
    } = opts;
    let {
        emitOnStart = true,
    } = opts;

    let oldVal = getter();
    const frame = () => {
        const newVal = getter();
        if (emitOnStart) {
            watcher.emitChange(newVal);
            emitOnStart = false;
        }
        if (!isEqual(oldVal, newVal)) {
            watcher.emitChange(newVal);
            oldVal = newVal;
        }
    };

    const intervalId = setInterval(frame, pollInterval);
    watcher.setPropListenerDisposer(() => {
        clearInterval(intervalId);
    });

    return watcher;
}

export function watchCascadePair<A, B>(
    parent: Watcher<A>,
    child: (newValue: A, oldWatcher?: Watcher<B>) => Watcher<B>,
) {
    let watcherB = new Watcher<B>();

    parent.on('change', newVal => {
        watcherB = child(newVal, watcherB);
    });

    watcherB.on('dispose', () => {
        parent.emit('dispose');
    });

    return watcherB;
}

export function watchCascade<A, B>(
    parent: Watcher<A>,
    child: (newValue: A, oldWatcher?: Watcher<B>) => Watcher<B>,
) {
    const b = watchCascadePair(parent, child);
    const next = (then: <C>(newValue?: B, oldWatcher?: Watcher<C>) => Watcher<C>) => {
        watchCascade(b, then);
    };

    Object.assign(next, {
        last: b
    });

    return next as (typeof next & { last: typeof b });
}