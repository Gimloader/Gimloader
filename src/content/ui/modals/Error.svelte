<script lang="ts">
    import * as Dialog from "$shared/ui/dialog";
    import { shouldUpdate } from "$shared/utils";
    import { version } from "../../../../package.json";

    interface Props {
        title: string;
        text: string;
        checkUpdates?: boolean;
        onClose: () => void;
    }

    let { title, text, onClose, checkUpdates }: Props = $props();

    interface VersionFetchInfo {
        lastFetch: number;
        version: string;
    }

    async function isOutdated(): Promise<false | string> {
        const delay = 1000 * 60 * 60; // 1 hour
        const now = Date.now();

        const versionFetchInfo = localStorage.getItem("gl-lastVersionFetch");
        if(versionFetchInfo) {
            const info: VersionFetchInfo = JSON.parse(versionFetchInfo);

            if(now - info.lastFetch < delay && shouldUpdate(version, info.version)) {
                return false;
            }
        }

        const fetchedVersion: string = await fetch(
            "https://raw.githubusercontent.com/Gimloader/Gimloader/refs/heads/main/package.json"
        )
            .then(res => res.json())
            .then(res => res.version);

        localStorage.setItem(
            "gl-lastVersionFetch",
            JSON.stringify({
                lastFetch: now,
                version: fetchedVersion
            })
        );

        if(shouldUpdate(version, fetchedVersion)) {
            return fetchedVersion;
        }
        return false;
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
                        reinstalling the extension.
                    </div>
                {/if}
            {/await}
        {/if}
    </Dialog.Content>
</Dialog.Root>
