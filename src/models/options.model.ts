export type Options = {
    exercises: Exercises,
    interval: number
}

export type Exercises = {
    id: string,
    label: string,
    enabled: boolean
}[]

export type Interval = {
    id: string,
    label: string,
    interval: number
}[]