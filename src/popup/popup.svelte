<script lang="ts">
    import type { Exercise } from "$models/options.model";
    // import Timer from "../components/Timer.svelte";

    const syncStorage = chrome.storage.sync;
    let countdown: number = 0;
    let nextAlarm: number = 0;
    let nextAmount: number = 0;
    let nextExercise: Exercise | undefined;
    let showTimer: boolean = false;

    (async () => {
        const {
            nextAlarm: alarm,
            nextAmount: amount,
            nextExercise: exercise,
        } = await syncStorage.get(["nextAlarm", "nextAmount", "nextExercise"]);
        nextAlarm = alarm;
        nextAmount = amount;
        nextExercise = exercise;
        countdown = nextAlarm - Date.now() / 1000;
        showTimer = countdown > 0;
        setTimer();
    })();

    function setTimer() {
        const timer = setInterval(() => {
            countdown = nextAlarm - Date.now() / 1000;

            if (countdown <= 0) {
                clearInterval(timer);
                countdown = 0;
                showTimer = false;
            }
        }, 1000);
    }

    function formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        let result = "";
        if (h > 0) result += `${h}h `;
        if (m > 0 || h > 0) result += `${m}m `;
        result += `${s}s`;

        return result.trim();
    }

    function openSettings() {
        return chrome.runtime.openOptionsPage();
    }
</script>

<svelte:head>
    <link rel="preload" as="font" href="/Inter.woff2" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="grid grid-rows-[5rem_1fr_2rem] h-[calc(100vh)] w-full p-4 box-border">
    <!-- Top Row -->
    <div class="font-sans">
        <!-- Content for top row -->
        {#if showTimer}
            <p class="font-bold text-main-secondary">Up next</p>
            <p class="text-lg">{nextExercise?.label}</p>
        {/if}
    </div>

    <!-- Middle Row -->
    <div class="font-sans font-bold flex justify-center items-center m-4" style="height: calc(100vh - 14rem);">
        <!-- Content for middle row -->
        <p class="text-5xl">
            {#if showTimer}
                {formatTime(countdown)}
            {:else if nextExercise}
                Time to do {nextAmount}
                {nextExercise.label.toLocaleLowerCase()}!
                <div class="text-sm ">
                    <button> Snooze </button>
                    <button> Complete </button>
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

<!-- TODO: Create a setInterval timer on page load that live calculates the time left every second 
    - When time is up, replace the timer with "Time to do x x" text
-->
<!-- TODO: When the Complete button is pressed in notification or popup, update the Up next text
    - Use a binder https://chatgpt.com/c/66fba203-1fd4-800f-9204-dd25cf999dd9
-->
