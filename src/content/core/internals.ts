import EventEmitter2 from "eventemitter2";
import Rewriter from "./rewriter";
import type { Stores } from "$types/stores/stores";

export default class GimkitInternals {
    static stores: Stores;
    static notification: any;
    static message: any;
    static modal: any;
    static platformerPhysics: any;
    static events = new EventEmitter2();

    static init() {
        // window.stores
        Rewriter.exposeObject("FixSpinePlugin", "stores", "assignment:new", (stores) => {
            this.stores = stores;
            window.stores = stores;

            this.events.emit("stores", stores);
        });

        // ant-design notifications
        Rewriter.exposeObject("index", "notification", "useNotification:", (notifs) => {
            this.notification = notifs;

            this.events.emit("notification", notifs);
        });

        // ant-design message
        Rewriter.exposeObject("index", "message", "useMessage:", (msgs) => {
            this.message = msgs;

            this.events.emit("message", msgs);
        });

        // ant-design modal
        Rewriter.exposeObjectBefore(true, "modal", ".useModal=", (modal) => {
            this.modal = modal;

            this.events.emit("modal", modal);
        });

        // window.platformerPhysics
        Rewriter.exposeObject("App", "platformerPhysics", "topDownBaseSpeed:", (phys) => {
            this.platformerPhysics = phys;
            window.platformerPhysics = phys;

            this.events.emit("platformerPhysics", phys);
        });
    }
}
