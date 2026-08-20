import Poller from "./net/poller";
import Server from "./net/server";
import Updater from "./net/updater";
import Downloader from "./net/downloader";
import StateManager from "$shared/state";
import loadState from "./state";

Server.init();
Updater.init();
Downloader.init();

StateManager.events.on("init", (state) => {
    Poller.init(state.settings.pollerEnabled);
});

// open the editor when requested
Server.onMessage("showEditor", async ({ type, name, folder }) => {
    const params = new URLSearchParams();
    params.set("type", type);
    if(folder) params.set("folder", folder);
    if(name) params.set("name", name);

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.create({
        url: `/editor.html?${params.toString()}`,
        openerTabId: tabs[0]?.id
    });
});

loadState();
