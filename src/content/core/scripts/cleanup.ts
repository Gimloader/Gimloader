import EventEmitter2 from "eventemitter2";

export default class Cleanup {
    static events = new EventEmitter2({ maxListeners: 500 });

    static on(id: string, callback: (final: boolean) => void) {
        this.events.once(id, callback);
    }

    static off(id: string, callback: (final: boolean) => void) {
        this.events.off(id, callback);
    }

    static cleanup(id: string, final: boolean) {
        this.events.emit(id, final);
    }

    static manualOrAutoCleanup(id: string | null, callback: () => void) {
        if(!id) return callback;

        const cleanup = () => {
            this.off(id, cleanup);
            callback();
        };

        this.on(id, cleanup);
        return cleanup;
    }

    static addCleanedUpItem<T>(id: string | null, array: T[], item: T) {
        array.push(item);

        return this.manualOrAutoCleanup(id, () => {
            const index = array.indexOf(item);
            if(index !== -1) array.splice(index, 1);
        });
    }
}
