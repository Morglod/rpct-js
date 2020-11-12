"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchCascade = exports.watchCascadePair = exports.watchProperty = exports.Watcher = void 0;
const tsee_1 = require("tsee");
const DEFAULT_POLL_INTERVAL = 300;
const defaultIsEqual = (a, b) => a === b;
class Watcher extends tsee_1.EventEmitter {
    constructor(propListenerDisposer) {
        super();
        this.emitChange = (newValue) => {
            const oldValue = this.lastValue;
            this.lastValue = newValue;
            this.emit('change', newValue, oldValue);
        };
        this.setPropListenerDisposer = (disposer) => {
            this.disposePropListener();
            this._propListenerDisposer = disposer;
        };
        /** unbind all listeners from this watcher and bind to other */
        this.rebindTo = (otherWatcher) => {
            const l = this.rawListeners('change');
            otherWatcher.rawListeners('change').push(...l);
            l.splice(0, l.length);
        };
        /** unbind all listeners from this watcher and bind to other and disposeEmitter */
        this.rebindDisposePropListener = (otherWatcher) => {
            this.rebindTo(otherWatcher);
            this.disposePropListener();
        };
        this.disposePropListener = () => {
            if (this.propListenerDisposer) {
                this.propListenerDisposer();
                this._propListenerDisposer = undefined;
            }
        };
        this._propListenerDisposer = propListenerDisposer;
    }
    get propListenerDisposer() {
        return this._propListenerDisposer;
    }
}
exports.Watcher = Watcher;
function watchProperty(getter, opts = {}) {
    const { pollInterval = DEFAULT_POLL_INTERVAL, isEqual = defaultIsEqual, watcher = new Watcher(), } = opts;
    let { emitOnStart = true, } = opts;
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
exports.watchProperty = watchProperty;
function watchCascadePair(parent, child) {
    let watcherB = new Watcher();
    parent.on('change', newVal => {
        watcherB = child(newVal, watcherB);
    });
    watcherB.on('dispose', () => {
        parent.emit('dispose');
    });
    return watcherB;
}
exports.watchCascadePair = watchCascadePair;
function watchCascade(parent, child) {
    const b = watchCascadePair(parent, child);
    const next = (then) => {
        watchCascade(b, then);
    };
    Object.assign(next, {
        last: b
    });
    return next;
}
exports.watchCascade = watchCascade;
