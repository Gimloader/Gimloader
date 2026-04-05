<script lang="ts">
    import * as Tooltip from "$shared/ui/tooltip";

    let { author }: { author: string | string[] } = $props();
</script>

{#if Array.isArray(author)}
    {#if author.length === 0}
        By Unknown Author
    {:else if author.length === 1}
        By {author[0]}
    {:else if author.length === 2}
        By {author[0]} and {author[1]}
    {:else}
        By {author[0]}, {author[1]},
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger class="underline decoration-dashed">
                    +{author.length - 2} more
                </Tooltip.Trigger>
                <Tooltip.Content class="text-base" side="bottom">
                    {#each author.slice(2) as authorName}
                        <div>{authorName}</div>
                    {/each}
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    {/if}
{:else}
    By {author}
{/if}
