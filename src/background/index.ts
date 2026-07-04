import Poller from "./net/poller";
import Server from "./net/server";
import { statePromise } from "./state";
import Updater from "./net/updater";
import { log } from "$shared/utils";
import Downloader from "./net/downloader";

Server.init();
Updater.init();
Downloader.init();

statePromise.then((state) => {
    log(state);
    Poller.init(state.settings.pollerEnabled);
});

// open the editor when requested
Server.onMessage("showEditor", async (_, { type, name, folder }) => {
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
