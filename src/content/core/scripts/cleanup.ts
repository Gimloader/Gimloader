import EventEmitter3 from "eventemitter3";

export default class Cleanup {
    static onStopEvents = new EventEmitter3();
    static events = new EventEmitter3();
    static cleanupDisabled = false;

    static on(id: string, callback: () => void) {
        if(this.cleanupDisabled) return;
        this.events.once(id, callback);
    }

    static onStop(id: string, callback: () => void) {
        this.onStopEvents.once(id, callback);
    }

    static off(id: string, callback: () => void) {
        this.events.off(id, callback);
    }

    static cleanup(id: string) {
        // onStop events need to go first since they might use things (eg createShared) that get cleaned up after
        this.onStopEvents.emit(id);
        this.events.emit(id);
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

    static runWithoutCleanup<T>(callback: () => T): T {
        this.cleanupDisabled = true;

        try {
            const result = callback();
            this.cleanupDisabled = false;
            return result;
        } catch (e) {
            this.cleanupDisabled = false;
            throw e;
        }
    }
}
