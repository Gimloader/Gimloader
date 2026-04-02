import { domLoaded } from "$content/utils";
import { mount } from "svelte";
import Root from "$content/ui/Root.svelte";
import Modals from "../modals.svelte";
import DependencyModal from "$content/ui/dependencies/DependencyModal.svelte";
import ErrorModal from "$content/ui/modals/Error.svelte";
import PluginSettings from "$content/ui/settings/PluginSettings.svelte";
import ConfirmModal from "$content/ui/modals/Confirm.svelte";
import SingleChangelog from "$content/ui/modals/SingleChangelog.svelte";

export default async function setupModals() {
    Modals.register("dependency", DependencyModal);
    Modals.register("error", ErrorModal);
    Modals.register("confirm", ConfirmModal);
    Modals.register("pluginSettings", PluginSettings);
    Modals.register("singleChangelog", SingleChangelog);

    await domLoaded;

    mount(Root, { target: document.body });
}
