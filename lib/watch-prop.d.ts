import { EventEmitter } from 'tsee';
declare type WatcherEvents<T> = {
    change: (newValue: T, oldValue?: T) => void;
    dispose: () => void;
};
export declare class Watcher<T> extends EventEmitter<WatcherEvents<T>> {
    constructor(propListenerDisposer?: () => void);
    private _propListenerDisposer?;
    readonly propListenerDisposer: (() => void) | undefined;
    lastValue: T | undefined;
    readonly emitChange: (newValue: T) => void;
    readonly setPropListenerDisposer: (disposer: (() => void) | undefined) => void;
    /** unbind all listeners from this watcher and bind to other */
    readonly rebindTo: (otherWatcher: Watcher<T>) => void;
    /** unbind all listeners from this watcher and bind to other and disposeEmitter */
    readonly rebindDisposePropListener: (otherWatcher: Watcher<T>) => void;
    readonly disposePropListener: () => void;
}
export declare function watchProperty<Value>(getter: () => Value, opts?: {
    pollInterval?: number;
    isEqual?: (oldV: Value, newV: Value) => boolean;
    watcher?: Watcher<Value>;
    /** true by default */
    emitOnStart?: boolean;
}): Watcher<Value>;
export declare function watchCascadePair<A, B>(parent: Watcher<A>, child: (newValue: A, oldWatcher?: Watcher<B>) => Watcher<B>): Watcher<B>;
export declare function watchCascade<A, B>(parent: Watcher<A>, child: (newValue: A, oldWatcher?: Watcher<B>) => Watcher<B>): ((then: <C>(newValue?: B | undefined, oldWatcher?: Watcher<C> | undefined) => Watcher<C>) => void) & {
    last: Watcher<B>;
};
export {};
