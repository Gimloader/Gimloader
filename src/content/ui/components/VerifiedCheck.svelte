<script lang="ts">
    import type { Script } from "$content/core/scripts/script.svelte";
    import BadgeCheck from "@lucide/svelte/icons/badge-check";
    import BadgeInfo from "@lucide/svelte/icons/badge-info";
    import BadgeAlert from "@lucide/svelte/icons/badge-alert";
    import * as Tooltip from "$shared/ui/tooltip";
    import { officialUrlBase } from "$shared/consts";

    let { script }: { script: Script } = $props();
    let validPromise = $derived(script?.verifySignature());
</script>

{#if script?.headers.signature}
    <Tooltip.Provider>
        <Tooltip.Root>
            <Tooltip.Trigger>
                {#await validPromise}
                    <BadgeInfo color="#faca15" size={16} />
                {:then valid}
                    {#if valid}
                        {@const type = script.type === "plugin" ? "plugins" : "libraries"}
                        {@const href = `${officialUrlBase}/${type}/${script.headers.name}`}
                        <a target="_blank" {href}>
                            <BadgeCheck class="text-primary" size={16} />
                        </a>
                    {:else}
                        <BadgeAlert color="#f05252" size={16} />
                    {/if}
                {/await}
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
                {#await validPromise}
                    Verifying signature...
                {:then valid}
                    {#if valid}
                        This {script.type} has been verified as an official Gimloader script.
                    {:else}
                        This {script.type} could not be verified as official.
                    {/if}
                {/await}
            </Tooltip.Content>
        </Tooltip.Root>
    </Tooltip.Provider>
{/if}
