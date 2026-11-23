<script lang="ts">
    import { gimloaderPackageUrl } from "$shared/consts";
    import * as Dialog from "$shared/ui/dialog";
    import { isVersionGreater } from "$shared/utils";
    import { version } from "../../../../package.json";

    interface Props {
        title: string;
        text: string;
        checkUpdates?: boolean;
        onClose: () => void;
    }

    let { title, text, onClose, checkUpdates }: Props = $props();

    async function isOutdated(): Promise<string | null> {
        const lastFetch = parseInt(localStorage.getItem("gl-lastVersionFetch") ?? "0", 10);
        const latestVersion = localStorage.getItem("latestVersion");
        const delay = 1000 * 60 * 20; // 20 minutes
        const now = Date.now();

        if(now - lastFetch < delay && latestVersion) {
            if(isVersionGreater(version, latestVersion)) return latestVersion;
            return null;
        }

        const res = await fetch(gimloaderPackageUrl);
        const json = await res.json();
        const newVersion = json.version;

        localStorage.setItem("gl-latestVersion", newVersion.toString());
        localStorage.setItem("gl-lastVersionFetch", Date.now().toString());

        if(isVersionGreater(version, newVersion)) return newVersion;
        return null;
    }
</script>

<Dialog.Root open onOpenChangeComplete={onClose}>
    <Dialog.Content class="block" style="max-width: min(760px, calc(100% - 32px))">
        <Dialog.Header class="font-bold text-lg w-full border-b">
            {title}
        </Dialog.Header>
        <pre class="whitespace-pre-wrap">{text}</pre>
        {#if checkUpdates}
            {#await isOutdated() then newVersion}
                {#if newVersion}
                    <div>
                        You may need to update Gimloader from v{version} to v{newVersion}. Try uninstalling and
                        reinstalling the Gimloader extension.
                    </div>
                {/if}
            {/await}
        {/if}
    </Dialog.Content>
</Dialog.Root>
