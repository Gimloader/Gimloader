import Api from "./api/api";
import Net from "./core/net";
import Parcel from "./core/parcel";

Object.defineProperty(unsafeWindow, "GL", {
    value: Api,
    writable: false,
    configurable: false
});

Parcel.init();
Net.init();