import whiteWrenchSvg from "$assets/wrench-light.svg";
import UI from "$core/ui/ui";
import Hotkeys from "$core/hotkeys/hotkeys.svelte";
import Rewriter from "../rewriter";
import { showMenu } from "$content/ui/modals/Menu.svelte";
import Commands from "../commands.svelte";

function addTabCommand(text: string, tab: string, keywords?: string[], officialOpen?: boolean) {
    Commands.addCommand(null, {
        text,
        keywords
    }, () => showMenu(tab, officialOpen));
}

export function addPluginButtons() {
    document.documentElement.classList.add("noPluginButtons");

    // add a hotkey shift+p to open the plugin manager
    Hotkeys.addHotkey(null, {
        key: "KeyP",
        alt: true,
        shift: false,
        ctrl: false
    }, () => showMenu());

    addTabCommand("Open Gimloader Menu", "plugins", ["manager"]);
    addTabCommand("View Plugins", "plugins");
    addTabCommand("View Official Plugins", "plugins", [], true);
    addTabCommand("View Libraries", "libraries", ["libs"]);
    addTabCommand("View Hotkeys", "hotkeys", ["binds"]);
    addTabCommand("View Updates", "updates", ["versions"]);
    addTabCommand("View Settings", "settings", ["options", "prefs"]);

    const whiteWrench = Rewriter.createMemoized("whiteWrenchSvg", () => {
        const wrenchBlob = new Blob([whiteWrenchSvg], { type: "image/svg+xml" });
        return URL.createObjectURL(wrenchBlob);
    });

    const openUI = Rewriter.createShared(null, "openPluginManager", showMenu);
    const createElement = `window.GL.React.createElement`;

    // Add the wrench button the homescreen
    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(`name:"far fa-search"`);
        if(index === -1) return;

        const start = code.lastIndexOf("push(", index) + 5;
        const end = code.indexOf("})})", index) + 3;
        let insert = code.slice(start, end);

        insert = insert.replace("Discovery", "Plugins");
        insert = insert.replace("fa-search", "fa-wrench gl-listButton");
        insert = Rewriter.replaceBetween(insert, "path:", ",", `onClick:()=>${openUI}(),`);

        code = code.slice(0, start) + insert + "," + code.slice(start);

        return code;
    });

    // Add the wrench button to the homescreen when logged out
    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(`name:"far fa-gamepad"`);
        if(index === -1) return;

        const start = code.lastIndexOf("push(", index) + 5;
        const end = code.indexOf("})})", index) + 3;
        let insert = code.slice(start, end);

        insert = insert.replace("Join Game", "Plugins");
        insert = insert.replace("fa-gamepad", "fa-wrench gl-listButton");
        insert = insert.replace('window.open("/join","_self")', `${openUI}()`);

        code = code.slice(0, start) + insert + "," + code.slice(start);

        return code;
    });

    // Add the wrench button to the ingame 2d HUD
    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(`tooltip:"Sound"`);
        if(index === -1) return;

        const start = code.lastIndexOf("[", index) + 1;
        const end = code.indexOf("})}),", index) + 5;
        let insert = code.slice(start, end);

        insert = insert.replace("Sound", "Plugins");
        insert = insert.replace("fa-waveform", "fa-wrench gl-button5");
        insert = Rewriter.replaceBetween(insert, "onClick:", ",", `onClick:()=>${openUI}(),`);

        code = code.slice(0, start) + insert + code.slice(start);
        return code;
    });

    // Add the wrench button the pregame 2d HUD
    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(`"#01579b",onClick:()=>`);
        if(index === -1) return;

        const start = code.lastIndexOf(",", code.lastIndexOf(".jsx(", index));
        const end = code.indexOf("})})", index) + 4;
        let insert = code.slice(start, end);

        insert = insert.replace("flex vc", "flex vc gl-button3");
        insert = Rewriter.replaceBetween(insert, "onClick:", "}", `onClick:()=>${openUI}()`);
        insert = Rewriter.replaceBetween(insert, "}),", "name]", `}),"Plugins"]`);
        insert = Rewriter.replaceBetween(insert, "src:", "iconImage,", `src:${whiteWrench},`);

        code = code.slice(0, start) + insert + code.slice(start);
        code = code.replace("space-between", "flex-start;\n  gap: 8px;");
        code = Rewriter.insertAfter(code, "sticker}s`,", "style:{flexGrow:1},");

        return code;
    });

    // Add the wrench button to the join screen
    const wrapJoin = Rewriter.createShared(null, "wrapJoinButton", (joinButton: () => any) => {
        return function() {
            const element = joinButton.apply(this, arguments);
            const newButton = UI.React.createElement("button", {
                className: "openPlugins",
                dangerouslySetInnerHTML: { __html: whiteWrenchSvg },
                onClick: () => showMenu()
            });

            return UI.React.createElement("div", { className: "gl-join" }, [element, newButton]);
        };
    });

    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf("JoinPrimaryButton");
        if(index === -1) return;

        // Just wrap it with a function here, it's easier
        const start = code.indexOf("=", index) + 1;
        const end = code.indexOf("onClick})", index) + 9;
        const component = code.slice(start, end);
        code = code.slice(0, start) + wrapJoin + "(" + component + ")" + code.slice(end);
        return code;
    });

    // Add the wrench button to the creative screem
    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(`tooltip:"Options"`);
        if(index === -1) return;

        const start = code.lastIndexOf("children:", index) + 9;
        const end = code.indexOf("})})", index) + 4;
        let insert = code.slice(start, end);

        insert = insert.replace("Options", "Plugins");
        insert = insert.replace("fa-cog", "fa-wrench gl-button5");
        insert = Rewriter.replaceBetween(insert, "onClick:", ",", `onClick:()=>${openUI}(),`);

        code = code.slice(0, start) + `${createElement}("div",{className:"gl-row"},[`
            + code.slice(start, end) + "," + insert + "])" + code.slice(end);
        return code;
    });

    // Add the button to the 1d host lobby
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf("getButtonInfo()");
        if(index === -1) return;

        const start = code.indexOf("children:", index) + 9;
        const end = code.indexOf("})", start) + 2;
        let insert = code.slice(start, end);
        insert = Rewriter.replaceBetween(insert, "{", "}", `{onClick:()=>${openUI}(),children:"Plugins",className:"gl-button"}`);

        code = code.slice(0, start) + `${createElement}("div",{className:"gl-row"},[`
            + insert + "," + code.slice(start, end) + "])" + code.slice(end);

        return code;
    });

    // Add the button to the 1d player lobby
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf("/client/img/svgLogoWhite.svg");
        if(index === -1) return;

        const start = code.lastIndexOf("children:", index) + 9;
        const end = code.indexOf("})", index) + 2;

        code = code.slice(0, start) + "[" + code.slice(start, end)
            + `,${createElement}("img",{src:${whiteWrench},style:{height:"30px",marginLeft:"8px",cursor:"pointer"},`
            + `onClick:()=>${openUI}(),className:"gl-button"})]` + code.slice(end);

        return code;
    });

    // Add the button to the 1d host game screen
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf("this.toggleMusic,");
        if(index === -1) return;

        const start = code.lastIndexOf(".jsx(", index) - 1;
        const end = code.indexOf(`"})`, index) + 3;
        let insert = code.slice(start, end);

        insert = Rewriter.replaceBetween(
            insert,
            "{",
            `"})`,
            `{onClick:()=>${openUI}(),icon:${createElement}("img",{src:${whiteWrench},`
                + `style:{width:"20px",marginTop:"-3px"},className:"gl-button2"}),tooltipMessage:"Plugins"})`
        );

        const insertIndex = code.lastIndexOf("[", start) + 1;
        code = code.slice(0, insertIndex) + insert + "," + code.slice(insertIndex);
        return code;
    });

    // Add the button to the 1d player game screen
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf(`label":"Menu"`);
        if(index === -1) return;

        const insertIndex = code.indexOf("{}),", index) + 4;
        code = code.slice(0, insertIndex)
            + `${createElement}("img",{src:${whiteWrench},style:{height:"22px",marginLeft:"10px",cursor:"pointer"},`
            + `onClick:()=>${openUI}(),className:"gl-button"}),` + code.slice(insertIndex);

        return code;
    });

    // Add the button to the Draw That host screen
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf(".draw.background.play(),");
        if(index === -1) return;

        const start = code.indexOf('jsx("div",{children:', index) + 20;
        const end = code.indexOf("})]})}),", start);
        const soundItem = code.slice(start, end);

        let pluginsItem = Rewriter.replaceBetween(soundItem, "title:`", "`,", "title:`Plugins`,");
        pluginsItem = pluginsItem.replace("{title", '{className:"gl-button",title');
        pluginsItem = Rewriter.replaceBetween(pluginsItem, "icon", ")", `icon:${createElement}("i",{className:"far fa-wrench"})`);
        pluginsItem = Rewriter.replaceBetween(pluginsItem, "onClick:", "}", `onClick:()=>${openUI}()}`);

        code = code.replace(soundItem, `[${pluginsItem},${soundItem}]`);
        code = code.replace('.jsx("div",{children:[', '.jsx("div",{style:{display:"flex",gap:5},children:[');

        return code;
    });

    // Add the button to the Draw That host ending screen
    Rewriter.addParseHook(null, "index", (code) => {
        const index = code.indexOf('children:"View Report"}):null,');
        if(index === -1) return;

        const start = code.indexOf("&&", index) + 2;
        const end = code.indexOf(",", code.indexOf("View Drawings"));
        let replace = code.slice(start, end);

        replace = replace.replace("View Drawings", "Plugins");
        replace = replace.replace("this.openDrawingModal", `()=>${openUI}()`);
        replace = Rewriter.replaceBetween(replace, "icon", ")", `className:"gl-button",icon:${createElement}("i",{className:"far fa-wrench"})`);

        return code.slice(0, index + 30) + `${replace},` + code.slice(index + 30);
    });
}
