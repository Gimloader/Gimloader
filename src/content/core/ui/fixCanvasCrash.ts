import Rewriter from "../rewriter";

export default function fixCanvasCrash() {
    let parent: HTMLDivElement | null = null;
    const canvasWrapperRef = Rewriter.createShared(null, "canvasWrapperRef", (element: HTMLDivElement) => {
        if(!parent) {
            parent = document.createElement("div");
            parent.id = "game-div-container";
            parent.className = "maxAll";

            const child = document.createElement("div");
            child.id = "game-div";
            child.className = "maxAll";
            child.style.overflow = "hidden";
            child.style.userSelect = "none";

            parent.appendChild(child);
        }

        element?.after(parent);
        element?.remove();
    });

    let firstTime = true;
    const isFirstTime = Rewriter.createShared(null, "isFirstTime", () => {
        if(!firstTime) return false;
        firstTime = false;
        return true;
    });

    Rewriter.addParseHook(null, "App", (code) => {
        const index = code.indexOf(".parentId,className");
        if(index === -1) return;

        const startIndex = code.lastIndexOf("[", index) + 1;
        const endIndex = code.indexOf("}})})", index) + 5;
        const conditionalIndex = code.lastIndexOf("(()=>{", startIndex) + 6;
        const sizeVarEnd = code.lastIndexOf("&&this.resize({", conditionalIndex);
        const sizeVarStart = code.lastIndexOf(";", sizeVarEnd) + 1;

        const insert = `window.GL.React.createElement("div",{ref:${canvasWrapperRef}})`;
        const conditional = `${isFirstTime}()&&`;
        const sizeVar = code.slice(sizeVarStart, sizeVarEnd);
        const sizeGuard = `&&${sizeVar}.contentRect.width>0&&${sizeVar}.contentRect.height>0`;

        return code.slice(0, sizeVarEnd) + sizeGuard + code.slice(sizeVarEnd, conditionalIndex) + conditional
            + code.slice(conditionalIndex, startIndex) + insert + code.slice(endIndex);
    });
}
