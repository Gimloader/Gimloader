import Changelog from "$content/ui/modals/Changelog.svelte";
import ReloadConfirm from "$content/ui/modals/ReloadConfirm.svelte";
import { domLoaded } from "$content/utils";
import { mount } from "svelte";
import Modals from "../modals.svelte";
import DependencyModal from "$content/ui/dependencies/DependencyModal.svelte";
import ErrorModal from "$content/ui/modals/Error.svelte";
import PluginSettings from "$content/ui/settings/PluginSettings.svelte";
import ConfirmModal from "$content/ui/modals/Confirm.svelte";
import Command from "$content/ui/Command.svelte";
import SingleChangelog from "$content/ui/modals/SingleChangelog.svelte";

export default async function setupModals() {
    Modals.register("dependency", DependencyModal);
    Modals.register("error", ErrorModal);
    Modals.register("confirm", ConfirmModal);
    Modals.register("pluginSettings", PluginSettings);
    Modals.register("singleChangelog", SingleChangelog);

    await domLoaded;

    const target = document.body;
    mount(ReloadConfirm, { target });
    mount(Changelog, { target });
    mount(Command, { target: document.body });
}
