<!-- https://svelte.dev/repl/a19df6f013434e01bb990349843af288?version=3.38.2 -->

<script lang="ts">
    import { onDestroy } from "svelte";
    import { tweened } from "svelte/motion";
    import { linear as easing } from "svelte/easing";
    import { fly } from "svelte/transition";

    export let nextAlarm: number;
    
    let countdown: number;

    let now = Date.now();
    let end = nextAlarm * 1000;
    countdown = (end - now) / 1000;

    $: count = Math.round((end - now) / 1000);
    $: h = Math.floor(count / 3600);
    $: m = Math.floor((count - h * 3600) / 60);
    $: s = count - h * 3600 - m * 60;

    function updateTimer() {
        now = Date.now();
    }

    let interval = setInterval(updateTimer, 1000);
    $: if (count === 0) clearInterval(interval);

    const duration = 1000;

    let offset = tweened(1, { duration, easing });
    let rotation = tweened(360, { duration, easing });

    $: offset.set(Math.max(count - 1, 0) / countdown);
    $: rotation.set((Math.max(count - 1, 0) / countdown) * 360);

    function padValue(value: number, length = 2, char = "0") {
        const { length: currentLength } = value.toString();
        if (currentLength >= length) return value.toString();
        return `${char.repeat(length - currentLength)}${value}`;
    }

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<main>
    <svg in:fly={{ y: -5 }} viewBox="-50 -50 100 100" width="250" height="250">
        <title>Remaining seconds: {count}</title>
        <g fill="none" stroke="currentColor" stroke-width="2">
            <circle stroke="currentColor" r="46" />
            <path
                stroke="hsl(208, 100%, 50%)"
                d="M 0 -46 a 46 46 0 0 0 0 92 46 46 0 0 0 0 -92"
                pathLength="1"
                stroke-dasharray="1"
                stroke-dashoffset={$offset}
            />
        </g>
        <g fill="hsl(208, 100%, 50%)" stroke="none">
            <g transform="rotate({$rotation})">
                <g transform="translate(0 -46)">
                    <circle r="4" />
                </g>
            </g>
        </g>

        <g fill="currentColor" text-anchor="middle" dominant-baseline="baseline" font-size="13">
            <text x="-3" y="6.5">
                {#each Object.entries({ h, m, s }) as [key, value], i}
                    {#if countdown >= 60 ** (2 - i)}
                        <tspan dx="3" font-weight="bold">{padValue(value)}</tspan><tspan dx="0.5" font-size="7"
                            >{key}</tspan
                        >
                    {/if}
                {/each}
            </text>
        </g>
    </svg>

    <!-- <div in:fly={{ y: -10, delay: 120 }}>
        <button on:click={handleNew}>New timer</button>

        {#if isPaused}
            <button disabled={isResetting || count === 0} on:click={handleStart}>
                <span class="visually-hidden">Start timer</span>

                <svg viewBox="-50 -50 100 100" width="30" height="30">
                    <g
                        fill="none"
                        stroke="currentColor"
                        stroke-width="20"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M -25 -40 l 60 40 -60 40z" />
                    </g>
                </svg>
            </button>
        {:else}
            <button disabled={isResetting || count === 0} on:click={handlePause}>
                <span class="visually-hidden">Pause timer</span>
                <svg viewBox="-50 -50 100 100" width="30" height="30">
                    <g
                        fill="none"
                        stroke="currentColor"
                        stroke-width="20"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M -25 -30 v 60 m 50 0 v -60" />
                    </g>
                </svg>
            </button>
        {/if}

        <button on:click={handleReset}>Reset timer</button>
    </div> -->
</main>

<style>
    main {
        padding: 0rem 1rem;
    }

    main > svg {
        width: 100%;
        height: auto;
        display: block;
        margin: 0 auto 2rem;
    }

    /* div {
        display: flex;
        align-items: center;
        justify-content: space-between;
    } */

    @supports (display: grid) {
        div {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            justify-content: initial;
            justify-items: center;
        }
    }

</style>
