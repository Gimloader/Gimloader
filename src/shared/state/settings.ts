import type { StateMessageProps } from "$types/net/messages";
import type { Settings } from "$types/net/state";
import { TypedEventEmitter } from "$shared/utils";
import { stateMessageEvents } from "./events";
import StateProperty from "./property";
import { defaultSettings } from "$shared/consts";

type SettingsEvents =
    & { any: [] }
    & {
        [key in keyof Settings]: [value: Settings[key]];
    };

export default class SettingsState extends TypedEventEmitter<SettingsEvents> {
    settings = new StateProperty<Settings>(defaultSettings);

    constructor() {
        super();

        stateMessageEvents.on("settingUpdate", this.onSettingUpdate.bind(this));
    }

    init(settings: Settings) {
        this.settings.init(settings);
    }

    update(settings: Settings) {
        for(const key in settings) {
            const settingKey = key as keyof Settings;
            if(settings[settingKey] === this.settings.value[settingKey]) continue;

            this.emit(key, settings[settingKey]);
        }

        this.settings.value = settings;
        this.emit("any");
    }

    onSettingUpdate({ key, value }: StateMessageProps<"settingUpdate">) {
        // @ts-expect-error better than the alternative
        this.settings.value[key] = value;

        this.emit(key, value);
        this.emit("any");
    }
}
