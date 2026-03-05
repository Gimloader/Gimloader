import type { StateMessages } from "$types/net/messages";
import type { State } from "$types/net/state";
import Server from "$bg/net/server";
import { saveDebounced } from "$bg/state";
import Updater from "$bg/net/updater";
import EventEmitter2 from "eventemitter2";

export default new class SettingsHandler extends EventEmitter2 {
    init() {
        Server.on("settingUpdate", this.onSettingUpdate.bind(this));
    }

    save() {
        saveDebounced("settings");
    }

    onSettingUpdate(state: State, message: StateMessages["settingUpdate"]) {
        state.settings[message.key] = message.value;
        this.save();
        this.emit(message.key, message.value);

        if(message.key === "autoUpdate" && message.value === true) {
            // the cooldown is intentionally ignored so you can re-check updates by toggling the setting on and off
            Updater.checkUpdates();
        }
    }
}();
