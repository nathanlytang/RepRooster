<script lang="ts">
    import Timer from "../components/Timer.svelte";

    let countdown: number | null;
    countdown = 7200;
</script>

<div>
    {#if countdown}
        <Timer {countdown} />
    {/if}
</div>
