import EventEmitter2 from "eventemitter2";
import Rewriter from "./rewriter";
import type { Message, Modal, Notification } from '$types/antd';

export default class GimkitInternals {
    static stores: Stores.Stores;
    static notification: Notification;
    static message: Message;
    static modal: Modal;
    static platformerPhysics: any;
    static events = new EventEmitter2();

    static init() {
        // window.stores
        Rewriter.exposeObject("FixSpinePlugin", "stores", "assignment:new", (stores: Stores.Stores) => {
            this.stores = stores;
            window.stores = stores;

            this.events.emit("stores", stores);
        });

        // ant-design notifications
        Rewriter.exposeObject("index", "notification", "useNotification:", (notifs: Notification) => {
            this.notification = notifs;

            this.events.emit("notification", notifs);
        });

        // ant-design message
        Rewriter.exposeObject("index", "message", "useMessage:", (msgs: Message) => {
            this.message = msgs;

            this.events.emit("message", msgs);
        });

        // ant-design modal
        Rewriter.exposeObjectBefore(true, "modal", ".useModal=", (modal: Modal) => {
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
