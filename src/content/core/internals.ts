import Rewriter from "./rewriter";
import type { AntdMessage, AntdModal, AntdNotification } from "$types/api/antd";
import { clearId, splicer } from "$content/utils";
import type { ClassicStores } from "$types/classic-stores";

export interface Internals {
    stores: Stores.Stores;
    notification: AntdNotification;
    message: AntdMessage;
    modal: AntdModal;
    platformerPhysics: any;
}

interface LoadCallback<K extends keyof Internals> {
    id: string | null;
    type: K;
    callback: (value: Internals[K]) => void;
}

export default class GimkitInternals {
    static stores: Stores.Stores;
    static notification: AntdNotification;
    static message: AntdMessage;
    static modal: AntdModal;
    static classicStores: ClassicStores;
    static platformerPhysics: any;

    static loadCallbacks: LoadCallback<keyof Internals>[] = [];

    static init() {
        // GL.stores
        Rewriter.exposeObject("FixSpinePlugin", "stores", "assignment:new", (stores: Stores.Stores) => {
            this.stores = stores;
            window.stores = stores;

            this.onLoaded("stores", stores);
        });

        // GL.classicStores
        Rewriter.exposeObject("index", "classicStores", "gameValues:new", (classicStores: ClassicStores) => {
            this.classicStores = classicStores;
        });

        // ant-design notifications
        Rewriter.exposeObject("index", "notification", "useNotification:", (notifs: AntdNotification) => {
            this.notification = notifs;

            this.onLoaded("notification", notifs);
        });

        // ant-design message
        Rewriter.exposeObject("index", "message", "useMessage:", (msgs: AntdMessage) => {
            this.message = msgs;

            this.onLoaded("message", msgs);
        });

        // ant-design modal
        Rewriter.exposeObjectBefore(true, "modal", ".useModal=", (modal: AntdModal) => {
            this.modal = modal;

            this.onLoaded("modal", modal);
        });

        // GL.platformerPhysics
        Rewriter.exposeObject("App", "platformerPhysics", "topDownBaseSpeed:", (phys) => {
            this.platformerPhysics = phys;
            window.platformerPhysics = phys;

            this.onLoaded("platformerPhysics", phys);
        });
    }

    static onLoaded<K extends keyof Internals>(type: K, value: Internals[K]) {
        for(let i = 0; i < this.loadCallbacks.length; i++) {
            if(this.loadCallbacks[i].type !== type) continue;
            this.loadCallbacks[i].callback(value);

            this.loadCallbacks.splice(i, 1);
            i--;
        }
    }

    static onLoad<K extends keyof Internals>(id: string | null, type: K, callback: (value: Internals[K]) => void) {
        if(this[type]) {
            callback(this[type] as Internals[K]);
            return;
        }

        return splicer(this.loadCallbacks, { id, type, callback });
    }

    static offLoad(id: string) {
        clearId(this.loadCallbacks, id);
    }
}
