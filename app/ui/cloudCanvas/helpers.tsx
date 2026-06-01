import { Word } from '@/app/lib/classes';
import Vec2 from 'victor'

/**
 * Calculates initial values for word constructor
 * @param key the string content
 * @param value the frequency of the word that will derive its size
 * @param cellSize the cellsize of the grid that the word is being placed into
 * @param gridSize the width and height of the grid in cells 
 * @returns the created word
 */
export function makeWord(key: string, value: number, cellSize: number, gridSize: Vec2): Word{
    const fontSize = (value*cellSize);
    const wordSize = measureWord(key, fontSize.toString() + 'px Arial')
    const cells = new Vec2(Math.ceil(wordSize.x/cellSize), Math.ceil(wordSize.y/cellSize))
    const center = new Vec2(Math.floor(gridSize.x / 2) - gridSize.x%2, Math.floor(gridSize.y / 2) - gridSize.y%2)

    const word: Word = new Word(key, wordSize, cells, value, center);
    return word;
}
/**
 * find the screen pixel size of a word's bounding box
 * @param text string content of the word
 * @param font the font with px value the word will be written in
 * @returns 
 */
export function measureWord(text: string, font: string): Vec2 {
    const canvas = new OffscreenCanvas(0, 0);
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Vec2(0, 0);
    ctx.font = font;
    const metrics = ctx.measureText(text);

    return new Vec2(
        metrics.width,
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent, //.height gives actual height which depends on tall letters being used, we want full height.
    );
}

/**
 * Check if a word is not ovelapping the edge of the grid
 * @param word the word to check
 * @param size width and height in cells of the grid the word is being placed in
 * @returns word is within bounds of grid
 */
export function checkBounds(word: Word, gridSize: Vec2): boolean {
    if(word.xSpan[1] >= gridSize.x || word.xSpan[0] < 0
    || word.ySpan[1] >= gridSize.y || word.ySpan[0] < 0){
        return false;
    }
    return true;
}

export function testGrid(p1: Vec2, p2: Vec2, grid: Array<Array<Word | number>>, gridSize: Vec2): Set<Word> {
    const hits: Set<Word> = new Set<Word>();
    const [xStart, xEnd] = p1.x < p2.x? [p1.x, p2.x] : [p2.x, p1.x];
    const [yStart, yEnd] = p1.y < p2.y? [p1.y, p2.y] : [p2.y, p1.y];
    for (let i = xStart; i <= xEnd; ++i) {
        for (let j = yStart; j <= yEnd; ++j) {
            const index = grid[i][gridSize.y - 1 - j];
            if (typeof (index) != 'number') {
                hits.add(index)
            }
        }
    }
    return hits;
}