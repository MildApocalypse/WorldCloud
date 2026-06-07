import { Word } from '@/app/lib/classes';
import { Vec4, Direction, SideTests } from '@/app/lib/types';
import Vec2 from 'victor'


export function useHelperHook() {
    let gridSize = new Vec2(0, 0);
    let elementSize = new Vec2(0, 0);
    function setSize(size: Vec2, cellSize: number) {
        elementSize = size;
        findGridSize(cellSize);
    }

    function findGridSize(cellSize: number) {
        const xDiv = elementSize.x / cellSize;
        const yDiv = elementSize.y / cellSize;

        gridSize = new Vec2(Math.trunc(xDiv), Math.trunc(yDiv));
    }
    /**
     * iteratively moves words to find a place to put them in wordcloud.
     * @param grid the grid of cells representing the space words are occupying
     * @param word word to be added
     * @param angle the given direction the word is being moved in
     * @param alternate which side of the word is being checked for collisions
     * @returns return the word if word was placed or null if not
     */
    function moveWord(grid: Array<Array<number | Word>>, word: Word, angle: number, alternate: boolean)
        : boolean {
        //get rough direction of angle: up, down, left or right
        const direction = new Vec2(Math.cos(angle), Math.sin(angle));

        const ratio = direction.x / direction.y;
        let cardinal: Direction = Direction.DOWN;
        if (Math.abs(ratio) < 1) {
            cardinal -= Math.max(0, Math.sign(direction.y));
        }
        else {
            cardinal = Direction.LEFT;
            cardinal += Math.max(0, Math.sign(direction.x));
        }

        //collision is checked by testing each cell occupied by the sides of the word. if 'alternate' is true,
        //we test the side equal and opposite the direction, e.g. up and down. if false, check the other two sides.
        let pushVector = new Vec2(0, 0); //the final vector that the word is moved by
        if (alternate) {
            const cols = checkCollision(word, cardinal, grid);
            for (const entry of cols.tests) {
                const overlap = findOverlap(word, entry, direction)
                if (overlap) {
                    const newVector = calculateMove(overlap, direction)
                    //we will get some different results if the word is overlapping multiple boxes. we use the biggest one
                    pushVector = pushVector.length() > newVector.length() ? pushVector : newVector;
                }
            }
        }
        else {
            const cols = checkCollision(word, (cardinal + 2) % 5, grid);
            for (const entry of cols.tests) {
                const overlap = findOverlap(word, entry, direction);
                if (overlap) {
                    const newVector = calculateMove(overlap, direction);
                    pushVector = pushVector.length() > newVector.length() ? pushVector : newVector;
                }
            }
        }
        if (pushVector.isEqualTo(new Vec2(0, 0))) {
            return false
        }
        word.move(new Vec2(Math.round(pushVector.x) * Math.sign(direction.x), Math.round(pushVector.y) * Math.sign(direction.y)));
        return true
    }

    /**
     * Check the grid cells covered along the given sides of the given word (either left/right or up/down sides). 
     * @param word the given word
     * @param cardinal the direction to check, if left/right check the horizontal sides, if up/down check the top and bottom sides
     * @param grid the grid of cells containing all words added so far
     * @returns a set of all hits and whether there are any hits on opposite sides of the word.
     */
    function checkCollision(word: Word, cardinal: Direction, grid: Array<Array<number | Word>>): SideTests {
        const p1 = new Vec2(word.xSpan[0], word.ySpan[1])
        const p2 = new Vec2(word.xSpan[1], word.ySpan[1])
        const p3 = new Vec2(word.xSpan[0], word.ySpan[0])
        const p4 = new Vec2(word.xSpan[1], word.ySpan[0])

        let side1: Set<Word>;
        let side2: Set<Word>;
        if (cardinal < Direction.LEFT) {
            side1 = testGrid(p1, p2, grid);
            side2 = testGrid(p3, p4, grid);
        }
        else {
            side1 = testGrid(p1, p3, grid);
            side2 = testGrid(p2, p4, grid);
        }

        const collisions = side1.union(side2);

        return { tests: collisions }
    }

    function calculateMove(overlap: Vec4, direction: Vec2): Vec2 {

        const xLim = overlap.x;
        const yLim = overlap.y;

        //calucluate what final movement vector would be if x or y value were set to xLim or yLim, respectively
        const xRes = Math.abs((yLim / direction.y) * direction.x);
        const yRes = Math.abs((xLim / direction.x) * direction.y);

        //if result value is greater than corresponding limit value, discard. we add pos/neg signs later so we can round up first
        return (xRes <= xLim) ? new Vec2(xRes, yLim) : new Vec2(xLim, yRes);
    }

    /**
     * Amount of overlap between word 1 with word 2
     * @param word1 word being moved
     * @param word2 word being overlapped with
     * @param direction given direction word is being moved in
     * @returns amount of overlap (x, y) as well as which side the overlap is on(z, w) (0 = left/down, 1 = right/up)
     */
    function findOverlap(word1: Word, word2: Word, direction: Vec2): Vec4 | null {

        const difference = word1.location.clone().subtract(word2.location)
        const x = Math.sign(direction.x) > 0 ? word2.xSpan[1] + 1 - word1.xSpan[0] : word1.xSpan[1] - (word2.xSpan[0] - 1);
        const y = Math.sign(direction.y) > 0 ? word2.ySpan[1] + 1 - word1.ySpan[0] : word1.ySpan[1] - (word2.ySpan[0] - 1);

        if (x > 0 && x < word1.cellSize.x + word2.cellSize.x && y > 0 && y < word1.cellSize.y + word2.cellSize.y) {

            const overSidex = Math.max(0, Math.sign(difference.x))
            const overSidey = Math.max(0, Math.sign(difference.y))

            return { x: x, y: y, z: overSidex, w: overSidey }
        }
        return null;
    }

    /**
     * Calculates initial values for word constructor
     * @param key the string content
     * @param value the frequency of the word that will derive its size
     * @param cellSize the cellsize of the grid that the word is being placed into
     * @returns the created word
     */
    function makeWord(key: string, value: number, cellSize: number): Word {
        const fontSize = (value * cellSize);
        const wordSize = measureWord(key, fontSize.toString() + 'px Arial')
        const cells = new Vec2(Math.ceil(wordSize.x / cellSize), Math.ceil(wordSize.y / cellSize))
        const center = new Vec2(Math.floor(gridSize.x / 2) - gridSize.x % 2, Math.floor(gridSize.y / 2) - gridSize.y % 2)

        const word: Word = new Word(key, wordSize, cells, value, center);
        return word;
    }

    /**
     * find the screen pixel size of a word's bounding box
     * @param text string content of the word
     * @param font the font with px value the word will be written in
     * @returns 
     */
    function measureWord(text: string, font: string): Vec2 {
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
     * @returns word is within bounds of grid
     */
    function checkBounds(word: Word): boolean {
        if (word.xSpan[1] >= gridSize.x || word.xSpan[0] < 0
            || word.ySpan[1] >= gridSize.y || word.ySpan[0] < 0) {
            return false;
        }
        return true;
    }

    function testGrid(p1: Vec2, p2: Vec2, grid: Array<Array<Word | number>>): Set<Word> {
        const hits: Set<Word> = new Set<Word>();
        const [xStart, xEnd] = p1.x < p2.x ? [p1.x, p2.x] : [p2.x, p1.x];
        const [yStart, yEnd] = p1.y < p2.y ? [p1.y, p2.y] : [p2.y, p1.y];
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
    return {
        moveWord,
        checkCollision,
        calculateMove,
        findOverlap,
        makeWord,
        measureWord,
        checkBounds,
        testGrid,
        gridSize,
        elementSize,
        setSize,
    }
}