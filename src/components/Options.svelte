<script lang="ts">
    import { onMount } from "svelte";
    import { Label } from "$lib/components/ui/label";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import type { Options } from "$models/options.model";
    import { DefaultExercises, Intervals } from "$models/options.model";
    import * as RadioGroup from "$lib/components/ui/radio-group";

    let message: string | null = null;
    const intervals = Intervals;
    let options: Options = {
        exercises: DefaultExercises,
        interval: 1800,
    };

    onMount(() => {
        chrome.storage.sync.get((data: Options) => {
            if (Object.keys(data).length > 0) {
                options = data;
            }
        });
    });

    const handleSave = () => {
        chrome.storage.sync.set(options).then(() => {
            message = "Updated!";

            setTimeout(() => {
                message = null;
            }, 2000);
        });
    };
</script>

<div class="p-[2%] text-slate-800">
    <h1 class="mb-5 ml-4 text-2xl font-semibold">Settings</h1>

    <form on:submit|preventDefault={handleSave}>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div class="col-span-1 lg:col-span-2 lg:min-w-[8.333%] lg:max-w-[8.333%] p-4">
                <h2 class="text-2xl lg:text-base font-semibold -mt-2">Exercises</h2>
            </div>

            <div class="col-span-1 lg:col-span-10 lg:col-start-3 p-4 selection:">
                {#each options.exercises as exercise}
                    <div class="ml-2 mr-2 mb-4 flex items-center space-x-2">
                        <Checkbox
                            id={exercise.id}
                            bind:checked={exercise.enabled}
                            class="w-4 h-4 rounded-sm {exercise.enabled
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-slate-300'}"
                        />
                        <Label
                            for={exercise.id}
                            class="text-sm hover:cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {exercise.label}
                        </Label>
                    </div>
                {/each}
            </div>

            <div class="col-span-1 lg:col-span-2 lg:min-w-[8.333%] lg:max-w-[8.333%] p-4">
                <h2 class="text-2xl lg:text-base font-semibold -mt-2">Interval</h2>
            </div>

            <div class="col-span-1 lg:col-span-10 lg:col-start-3 p-4 text-2xl lg:text-base">
                <RadioGroup.Root
                    onValueChange={(value) => (options.interval = parseInt(value))}
                    value={options.interval.toString()}
                >
                    {#each intervals as eachInterval}
                        <div class="ml-2 mr-2 mb-2 flex items-center space-x-2">
                            <RadioGroup.Item
                                id={eachInterval.id}
                                value={eachInterval.interval.toString()}
                                class="w-4 h-4 rounded-2xl {eachInterval.interval === options.interval
                                    ? 'border-blue-500 border-[5px]'
                                    : 'border-slate-300'}"
                            />
                            <Label class="hover:cursor-pointer" for={eachInterval.id}>{eachInterval.label}</Label>
                        </div>
                    {/each}
                    <RadioGroup.Input name="interval" />
                </RadioGroup.Root>
            </div>
        </div>

        <button class="w-36 bg-blue-500 text-white text-base font-bold py-2 px-4 rounded mt-4 mb-4" type="submit">
            Save
        </button>
    </form>

    {#if message}
        <span class="font-bold text-blue-800">{message}</span>
    {/if}
</div>
