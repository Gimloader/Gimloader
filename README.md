# Gimloader
[![Discord Support Server](https://img.shields.io/badge/Discord-Support_Server-5865F2?logo=discord)](https://discord.gg/qG3zrETuMH)

Gimloader is a Gimkit plugin loader and manager, which allows you to modify the game to improve your experience. Gimloader comes with a variety of official plugins for things like freely moving your camera, timing speedruns, in-game chat, and much more.

## Installation

1. Install the extension for your browser: [Chrome Webstore](https://chromewebstore.google.com/detail/gimloader/ngbhofnofkggjbpkpnogcdfdgjkpmgka) for Chromium browsers such as Chrome, Edge, Opera, Brave, etc and [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/gimloader/) for Firefox.
2. Confirm it's working by going to [gimkit.com/join](https://www.gimkit.com/join). There should be a wrench icon next to the join button.

![UI Preview](/images/UIPreview.png)

## Usage

At any point, you can open the Gimloader menu by pressing `Alt + P` when in Gimkit or by clicking the wrench icon that is added to most pages. The Gimloader menu allows you to manage your plugins, and configure any hotkeys or settings that they may have.

At any point, you can browse the official plugins with the "Official Plugins" button on the top left of the plugins tab, or you can look through the [List of Plugins](https://gimloader.github.io/plugins/). You can also install plugins from other developers or create your own.

## Script Development

Documentation for the Gimloader api as well as some basics on making plugins can be found at https://gimloader.github.io/development/overview.

## Building From Source

1. Clone this repository
2. Make sure you have [bun](https://bun.sh/) installed
3. Install dependencies: `bun i --frozen-lockfile`
4. Build the extension: `bun run buildAll` for Chromium, and `bun run buildAllFirefox` for Firefox.
5. The extension will be output in `./extension/build`. You can load this in `chrome://extensions` (or equivalent) by enabling developer mode in the top right, or on `about:debugging` on Firefox with the `Load Temporary Add-on` button.
6. If you want to watch for changes and quickly rebuild the extension, run `bun run watch` or `bun run watchFirefox`.

### Before Committing

Before committing, make sure to run `bun run format` and `bun run check` to format your code and identify issues that there may be with it.
