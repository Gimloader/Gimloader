# Gimloader

This is a Gimkit plugin loader and manager, based on a trick first used in [Gimhook](https://codeberg.org/gimhook/gimhook) with an API inspired by [BetterDiscord](https://docs.betterdiscord.app/api/).

## Installation

1. Install the extension for your browser: [Chrome Webstore](https://chromewebstore.google.com/detail/gimloader/ngbhofnofkggjbpkpnogcdfdgjkpmgka) for Chromium browser such as Chrome, Edge, Opera, Brave, etc and [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/gimloader/) for Firefox.
2. Confirm it's working by going to [gimkit.com/join](https://www.gimkit.com/join). There should be a wrench icon next to the join button.

![UI Preview](/images/UIPreview.png)

## Usage

At any point, you can open the mod menu by pressing `alt + p`.

<details>
<summary>I also painstakingly added buttons on every screen I could think of.</summary>

![1d host lobby](/images/1dHost.png)
![1d host in game](/images/1dHostIngame.png)
![1d player in game](/images/1dIngame.png)
![1d player lobby](/images/1dJoin.png)
![2d host](/images/2dHost.png)
![2d player](/images/2dPlayer.png)
![Creative](/images/Creative.png)
![Home](/images/HomeScreen.png)
![Join Screen](/images/JoinScreen.png)

</details>

These buttons can be disabled in the settings section.

Once in the mod menu, you can create or import plugins with the two buttons at the top. There are some example plugins [here](/plugins/). Some plugins depend on libraries, which you can manage in the libraries tab. Some plugins may also add hotkeys that you can change, which will be in the hotkeys tab.

## Development

Documentation for the Gimloader api as well as some basics on making plugins can be found at https://thelazysquid.github.io/Gimloader.