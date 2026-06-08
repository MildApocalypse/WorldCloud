import { Word } from "./classes";
import Vec2 from 'victor'

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

export type HookHelpers = {
    moveWord: (grid: Array<Array<number | Word>>, word: Word, angle: number, alternate: boolean) => boolean,
    checkCollision: (word: Word, cardinal: Direction, grid: Array<Array<number | Word>>) => SideTests,
    calculateMove: (overlap: Vec4, direction: Vec2) => Vec2,
    findOverlap: (word1: Word, word2: Word, direction: Vec2) => Vec4 | null,
    makeWord: (key: string, value: number, cellSize: number) => Word,
    measureWord: (text: string, font: string) => Vec2,
    checkBounds: (word: Word) => boolean,
    testGrid: (p1: Vec2, p2: Vec2, grid: Array<Array<Word | number>>) => Set<Word>,
    fillGrid: (grid: Array<Array<number | Word>>, word: Word) => void;
};

