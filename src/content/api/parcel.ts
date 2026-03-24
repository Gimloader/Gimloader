import { nop } from "$shared/utils";

class BaseParcelApi {
    query(): any {}

    queryAll(): any[] {
        return [];
    }
}

class ParcelApi extends BaseParcelApi {
    getLazy() {
        return nop;
    }

    stopLazy() {}

    get interceptRequire() {
        return this.getLazy;
    }

    get stopIntercepts() {
        return this.stopLazy;
    }
}

class ScopedParcelApi extends BaseParcelApi {
    getLazy() {
        return nop;
    }
}

Object.freeze(BaseParcelApi);
Object.freeze(BaseParcelApi.prototype);
Object.freeze(ParcelApi);
Object.freeze(ParcelApi.prototype);
Object.freeze(ScopedParcelApi);
Object.freeze(ScopedParcelApi.prototype);
export { ParcelApi, ScopedParcelApi };
