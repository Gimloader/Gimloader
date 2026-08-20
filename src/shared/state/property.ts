export default class StateProperty<T> {
    #getValue: () => T;
    #setValue: (val: T) => void;
    #internalVal: T;
    #initialized = false;

    constructor(defaultVal: T) {
        this.#internalVal = defaultVal;
        this.#getValue = () => this.#internalVal;
        this.#setValue = (newVal) => this.#internalVal = newVal;
    }

    init(value: T) {
        this.#setValue(value);
        this.#internalVal = value;
        this.#initialized = true;
    }

    bind(getValue: () => T, setValue: (val: T) => void) {
        this.#getValue = getValue;
        this.#setValue = setValue;
        if(this.#initialized) setValue(this.#internalVal);
    }

    get value() {
        return this.#getValue();
    }

    set value(val: T) {
        this.#setValue?.(val);
    }
}
