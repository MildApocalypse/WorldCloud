
import Vec2 from 'victor'

export type Vec4 = { x: number; y: number; z: number, w: number };

export type WordFreq = {
    word: string;
    count: number;
}

export type Word = {
    content: string
    size: Vec2 //pixel size
    cellSize: Vec2 //cell size
    frequencyCategory: number //class of frequency
    location: Vec2 //cell coordinates
}

export type SideTests = {
    tests: Set<Word>,
    oppositeVectors: boolean
}

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

