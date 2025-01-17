import { type Exercise, DefaultExercises, type Options } from "./models/options.model";

const syncStorage = chrome.storage.sync;
let settings: Options;
const MIN = 10;
const MAX = 20;

// Initialize settings if they do not exist on extension load
chrome.runtime.onInstalled.addListener(async () => {
    await startUp();
    setNextExercise();
});

chrome.runtime.onStartup.addListener(async () => {
    await startUp();
    setNextExercise();
});

chrome.management.onEnabled.addListener(async () => {
    await startUp();
    setNextExercise();
});

async function startUp() {
    settings = (await syncStorage.get("settings") as { settings: Options }).settings;

    if (!settings || !settings.exercises || !settings.interval) {
        settings = {
            exercises: DefaultExercises,
            interval: 1800,
        };

        await syncStorage.set({ settings: settings });
    }
}

function getNextAlarm(): number {
    return Date.now() / 1000 + settings.interval;
    // return (Date.now() / 1000) + 5; // TODO: REMOVE IN PROD
}

function setNextExercise(amount?: number, exercise?: Exercise) {
    const nextAlarm = getNextAlarm();
    const randomAmount = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
    const availableExercises = settings.exercises.filter((exercise) => exercise.enabled === true);
    const randomExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];

    syncStorage.set({
        nextAlarm: nextAlarm,
        nextAmount: amount ?? randomAmount,
        nextExercise: exercise ?? randomExercise,
    });

    chrome.alarms.create("exercise", { when: nextAlarm * 1000 });

    return {
        nextAlarm,
        nextAmount: amount ?? randomAmount,
        nextExercise: exercise ?? randomExercise,
    };
}

// Create notification on alarm
chrome.alarms.onAlarm.addListener(async () => {
    await startUp();
    await Promise.all([syncStorage.get("nextAmount"), syncStorage.get("nextExercise")]).then(([amount, exercise]) => {
        chrome.notifications.create("exercise", {
            title: "RepRooster",
            message: `Time to do ${amount.nextAmount} ${exercise.nextExercise.label.toLowerCase()}!`,
            iconUrl: "../public/icon-48.png",
            type: "basic",
            requireInteraction: true,
            buttons: [{ title: "Snooze" }, { title: "Complete" }],
        });
    });
});

// Set next exercise when notification buttons clicked
chrome.notifications.onButtonClicked.addListener(async (_, buttonIndex) => {
    await startUp();
    // If Snooze Button, then keep the same exercise and set new timer
    if (buttonIndex === 0) {
        await Promise.all([syncStorage.get("nextAmount"), syncStorage.get("nextExercise")]).then(
            ([amount, exercise]) => {
                setNextExercise(amount.nextAmount, exercise.nextExercise);
            }
        );
    } else {
        setNextExercise();
        // TODO: Add to list of completed exercises
    }
});

// Open popup on notification click
chrome.notifications.onClicked.addListener(async () => {
    await startUp();
    chrome.tabs.create({ url: "/src/popup/index.html", active: true });
    
});

// Send and receive messages between pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        await startUp();
        if (request.message === "snooze") {
            console.log("snooze requested")
            sendResponse({ ...setNextExercise(request.amount, request.exercise) });
        } else if (request.message === "complete") {
            sendResponse({ ...setNextExercise() });
        } else if (request.message === "save") {
            settings = request.settings;
        }
    })();

    return true;
});