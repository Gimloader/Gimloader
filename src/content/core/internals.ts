import EventEmitter2 from "eventemitter2";
import Rewriter from "./rewriter";

export default class GimkitInternals {
    static stores: Stores.Stores;
    static notification: any;
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

        // window.platformerPhysics
        Rewriter.exposeObject("App", "platformerPhysics", "topDownBaseSpeed:", (phys) => {
            this.platformerPhysics = phys;
            window.platformerPhysics = phys;

            this.events.emit("platformerPhysics", phys);
        });
    }
}
