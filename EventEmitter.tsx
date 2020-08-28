
type Callback<T> = (input: T) => void;

export type Subscription = {
    cancel: Callback<void>;
};

interface Listener<T> {
    callback: Callback<T>;
    removed: boolean;
}

const debug = false;

export class EventEmitter<T> {
    listeners: Listener<T>[] = [];
    lastValue?: T;
    debugName: string;

    static counter = 0;

    constructor(debugName?: string) {
        this.debugName = debugName ?? (EventEmitter.counter++).toString();
    }

    log(message: string, opts?: any) {
        if (!debug) return;
        console.log("Emitter", this.debugName, message, opts);
    }

    warn(message: string) {
        if (!debug) return;
        console.warn("Emitter", this.debugName, message);
    }

    subscribe(callback: Callback<T>): Subscription {
        const obj = { callback: callback, removed: false };
        this.listeners.push(obj);

        let self = this;

        return {
            cancel: () => {
                const preLength = self.listeners.length;

                obj.removed = true; // mark as removed in case emit() is being called
                self.listeners = self.listeners.filter((l) => l !== obj);

                if (self.listeners.length === preLength) {
                    self.warn("listener already removed");
                    return;
                }
            },
        };
    }

    subscribeAndFireLast(callback: Callback<T>) {
        const sub = this.subscribe(callback);

        if (this.lastValue !== undefined) {
            callback(this.lastValue);
        }

        return sub;
    }

    emit(value: T) {
        this.listeners.map((item) => {
            if (item.removed) return null;

            item.callback(value);
            return null;
        });

        this.lastValue = value;
    }
}
