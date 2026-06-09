import { Word } from "./classes";

export type Vec4 = { x: number; y: number; z: number, w: number };

export type WordFreq = {
    word: string;
    count: number;
}

export type SideTests = {
    tests: Set<Word>,
}

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

