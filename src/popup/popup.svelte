<script lang="ts">
    import type { Exercise } from "$models/options.model";

    const syncStorage = chrome.storage.sync;

    let countdown = 0;
    let nextAlarm = 0;
    let nextAmount = 0;
    let nextExercise: Exercise | undefined;
    let showTimer = false;

    // Fetch initial data from sync storage
    (async () => {
        const {
            nextAlarm: alarm,
            nextAmount: amount,
            nextExercise: exercise,
        } = await syncStorage.get(["nextAlarm", "nextAmount", "nextExercise"]);

        nextAlarm = alarm || 0;
        nextAmount = amount || 0;
        nextExercise = exercise;
        countdown = nextAlarm - Date.now() / 1000;
        showTimer = countdown > 0;
    })();

    // Reactive block to update countdown and showTimer every second
    $: if (showTimer) {
        const interval = setInterval(() => {
            countdown = Math.max(0, Math.ceil(nextAlarm - Date.now() / 1000));
            showTimer = countdown > 0;

            if (!showTimer) clearInterval(interval); // Stop the interval when countdown reaches zero
        }, 1000);
    }

    function formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        return `${h > 0 ? h + "h " : ""}${m > 0 || h > 0 ? m + "m " : ""}${s}s`.trim();
    }

    function openSettings() {
        return chrome.runtime.openOptionsPage();
    }

    // Handle snooze and complete actions when clicked in popup
    async function setNextExercise(snooze = false) {
        let response;

        if (snooze) {
            response = await chrome.runtime.sendMessage({
                message: "snooze",
                amount: nextAmount,
                exercise: nextExercise,
            });
        } else {
            response = await chrome.runtime.sendMessage({ message: "complete" });
        }

        nextAlarm = response.nextAlarm;
        nextExercise = response.nextExercise;
        nextAmount = response.nextAmount;

        startTimer();

        chrome.notifications.clear("exercise");
    }

    function startTimer() {
        countdown = Math.ceil(nextAlarm - Date.now() / 1000);
        showTimer = countdown > 0;
    }

    // Handle case where notification buttons are clicked while popup is open
    chrome.notifications.onButtonClicked.addListener(async (_, buttonIndex) => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // HACK: Wait until background script has updated next data
        const settings = await syncStorage.get(); // Get new data

        nextAlarm = settings.nextAlarm;
        nextAmount = settings.nextAmount;
        nextExercise = settings.nextExercise;

        startTimer();
    });
</script>

<svelte:head>
    <link rel="preload" as="font" href="/Inter.woff2" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="grid grid-rows-[5rem_1fr_2rem] h-[calc(100vh)] w-full p-4 box-border">
    <!-- Top Row -->
    <div class="font-sans">
        {#if showTimer}
            <p class="font-bold text-main-secondary">Up next</p>
            <p class="text-lg">{nextExercise?.label}</p>
        {/if}
    </div>

    <!-- Middle Row -->
    <div class="font-sans font-bold flex justify-center items-center m-4" style="height: calc(100vh - 14rem);">
        <p class="text-5xl">
            {#if showTimer}
                {formatTime(countdown)}
            {:else if nextExercise}
                Time to do {nextAmount}
                {nextExercise.label.toLowerCase()}!
                <div class="text-sm mt-2">
                    <button
                        class="hover:text-red-500"
                        on:click={() => {
                            setNextExercise(true);
                        }}
                    >
                        Snooze
                    </button>
                    <button
                        class="hover:text-green-500"
                        on:click={() => {
                            setNextExercise();
                        }}
                    >
                        Complete
                    </button>
                </div>
            {/if}
        </p>
    </div>

    <!-- Bottom Row -->
    <div class="flex justify-between items-center">
        <button>
            <img src="/list_24.svg" alt="Logs" class="h-6 w-6" />
        </button>

        <button id="settingsButton" on:click={openSettings}>
            <img src="/settings_24.svg" alt="Settings" class="h-6 w-6" />
        </button>
    </div>
</div>
