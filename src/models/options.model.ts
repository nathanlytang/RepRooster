export type Options = {
    exercises: Exercises,
    interval: number
}

export type Exercise = {
    id: string,
    label: string,
    enabled: boolean
}

export type Exercises = Exercise[]

export const DefaultExercises: Exercises = [
    {
        id: "pushUp",
        label: "Push ups",
        enabled: true,
    },
    {
        id: "sitUp",
        label: "Sit ups",
        enabled: true,
    },
    {
        id: "squat",
        label: "Squats",
        enabled: true,
    },
    {
        id: "plank",
        label: "Planks",
        enabled: true,
    },
    {
        id: "burpee",
        label: "Burpees",
        enabled: true,
    },
    {
        id: "jumpingJack",
        label: "Jumping jacks",
        enabled: true,
    },
];

export type Interval = {
    id: string,
    label: string,
    interval: number
}[]

export const Intervals: Interval = [
    {
        id: "15m",
        label: "15 minutes",
        interval: 900,
    },
    {
        id: "30m",
        label: "30 minutes",
        interval: 1800,
    },
    {
        id: "45m",
        label: "45 minutes",
        interval: 2700,
    },
    {
        id: "1h",
        label: "1 hour",
        interval: 3600,
    },
    {
        id: "2h",
        label: "2 hours",
        interval: 7200,
    },
];