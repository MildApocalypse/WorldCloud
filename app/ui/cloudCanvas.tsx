'use client'
import { useEffect, useRef, useState } from 'react'
import { Word, Vec4, Direction, SideTests } from '../lib/types';
import { toRadians } from '../utils/math'
import Vec2 from 'victor';

let gridSizeX = 0;
let gridSizeY = 0;
const sizes = 7;
const cellSize = 13;

const debug = true;
const debuggrid = true;

export default function CloudCanvas({ tokens }: { tokens: Map<string, number> }) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef<number>(0);
    const indexRef = useRef<number>(1);
    const gridRef = useRef<Array<Array<Word|number>>>([[]])

    const sorted = [...tokens.entries()].sort((a, b) => (b[1] - a[1]))
    const highest = sorted[0][1];
    const wordList: [string, number][] = [...sorted].map(([key, value]) => [key, Math.trunc(value / highest * sizes - 0.000000001 + 1)])
    
    const [addedWords, updateAddedWords] = useState<Word[]>([])
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !tokens.size) return;
        const ctx = canvas.getContext('2d');

        let wordPool: Word[] = [];

        function makeWordCloud() {
            if (!canvas || !ctx) return;

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            const xDiv = canvas.width / cellSize;
            const yDiv = canvas.height / cellSize;

            gridSizeX = Math.trunc(xDiv);
            gridSizeY = Math.trunc(yDiv);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const grid = Array.from({ length: gridSizeX }, () => Array(gridSizeY).fill(0));
            gridRef.current = grid;

            wordPool = [];

            const firstElem = wordList[0];
            const firstWord = makeWord(firstElem[0], firstElem[1]);

            if(checkBounds(firstWord)){
                wordPool.push(firstWord);
                fillGrid(grid, firstWord);
            }
            else{
                console.log('could not add first word?') //todo: make proper error system
                return;
            }
            
            if(!debuggrid){
                let angle = 0;
                wordList.slice(1).forEach(([key, value]) => {

                    const word = makeWord(key, value);
                    //word.location.add(new Vec2(Math.cos(angle), Math.sin(angle)));
                    
                    if(!checkBounds(word)){ 
                        console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
                        return;
                    }
                    if(addWord(word, grid, angle)){
                        wordPool.push(word);
                    }
                    angle += toRadians(Math.random() * 10 + 10);
                });
            }

            if(debug){
                drawGrid(canvas);
                drawFilledCells(canvas, grid);
            }
            updateAddedWords(wordPool);
        }
        let resizeTimer = setTimeout(() => { return });
        const observer = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('res');
                setSize({ width: canvas.width, height: canvas.height });
                makeWordCloud();
            }, 100);
        });
        observer.observe(canvas);
        makeWordCloud();
        return () => observer.disconnect();
    }, [])

    function addOne(){
        if(gridRef.current.length === 0){
            console.log('grid is not initialized');
            return;
        }
        const pair = wordList[indexRef.current]
        const word = makeWord(pair[0], pair[1])
        //word.location.add(new Vec2(Math.cos(angleRef.current), Math.sin(angleRef.current)))
        let success = false;
        if(!checkBounds(word)){ 
            console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
            return;
        }
        if(success = addWord(word, gridRef.current, angleRef.current, canvasRef.current)){
            fillGrid(gridRef.current, word)
            indexRef.current += 1;
        }
        angleRef.current += toRadians(Math.random()*10 + 10);
        if(success){
            updateAddedWords(prev => [...prev, word]);
            if(debug&&canvasRef.current&&gridRef.current){
                drawGrid(canvasRef.current);
                drawFilledCells(canvasRef.current, gridRef.current);
            }
        }
    }

    return (
        <div className="relative w-full h-screen">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
            <WordCloudHTML words={addedWords} width={size.width} height={size.height} />
            {debuggrid && <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
            onClick={addOne}>
                Add Word</button>}
        </div>
    )
}

function WordCloudHTML({ words, width, height }: { words: Array<Word>, width: number, height: number }) {

    const ratio: Vec2 = new Vec2(width / gridSizeX, height / gridSizeY);

    function convert(word: Word): Vec2 {
        const x = word.location.x * ratio.x - word.size.x / 2;
        const y = word.location.y * ratio.y + word.size.y / 2;
        return new Vec2(x, y);
    }
    return (<>
        {words.map((word) => {
            const position = convert(word);
            return (<p key={word.content} style={{
                position: 'absolute', left: position.x, top: height - position.y,
                font: (word.frequencyCategory * cellSize).toString() + 'px Arial'
            }}>
                {word.content}
            </p>
            )
        })}
    </>)
}

function makeWord(key: string, value: number): Word{
    const fontSize = (value*cellSize);
    const wordSize = measureWord(key, fontSize.toString() + 'px Arial')
    const cells = new Vec2(Math.ceil(wordSize.x/cellSize), Math.ceil(wordSize.y/cellSize))
    const center = new Vec2(Math.floor(gridSizeX / 2) + 0.5, Math.floor(gridSizeY / 2) + 0.5)

    const word: Word = {content: key, size: wordSize, cellSize: cells, frequencyCategory: value, location: center}
    return word;
}

function addWord(word: Word, grid: Array<Array<number|Word>>, angle: number, canvas?: HTMLCanvasElement | null): boolean{
    let attempts = 0;
    let alternate = true;
    let moved = true;

    while (attempts < 300) {
        const prev = moved;
        moved = moveWord(grid, word, angle, alternate);
        if(!checkBounds(word)) break;
        if(canvas){
            drawGrid(canvas)
            drawFilledCells(canvas, grid);
            drawCurrentSpace(canvas, word);
        }
        if(!prev && !moved) {
            fillGrid(grid, word);
            return true;
        }
        attempts++;
        alternate = !alternate;
        if (attempts === 299) console.log('frodo');
    }
    return false
}

/**
 * iteratively moves words to find a place to put them in wordcloud.
 * @param grid the grid of cells representing the space words are occupying
 * @param word word to be added
 * @param angle the given direction the word is being moved in
 * @param alternate which side of the word is being checked for collisions
 * @param moved whether the word was moved last time the function was run. passed as an object in order to pass by ref
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
            if(overlap){
                const newVector = calculateMove(word, entry, overlap, direction)
                //we will get two different results if the word is overlapping multiple boxes. we use the biggest one.
                //its possible to overlap more than two other words, but this will be resolved on a later run.
                pushVector = pushVector.length() > newVector.length() ? pushVector : newVector;
            }
        }
    }
    else {
        const cols = checkCollision(word, (cardinal + 2) % 5, grid);
        //we allow 'nudge' movement if there is a collision on the alternate sides of the word.
        //if both sides are colliding, we dont move and continue in the given direction on the next run.
        if (cols.oppositeVectors) return false;
        for (const entry of cols.tests) {
            const overlap = findOverlap(word, entry, direction);
            if(overlap){
                const newVector = calculateMove(word, entry, overlap, direction);
                pushVector = pushVector.length() > newVector.length() ? pushVector : newVector;
            }
        }
    }
    if (pushVector.isEqualTo(new Vec2(0, 0))) {
        return false
    }
    word.location.add(new Vec2(Math.ceil(pushVector.x)*Math.sign(direction.x), Math.ceil(pushVector.y)*Math.sign(direction.y)));
    return true
}

/**
 * Check the grid cells covered along the given sides of the given word (either left/right or up/down sides). 
 * @param word the given word
 * @param cardinal the direction to check, if left/right check the horizontal sides, if up/down check the top and bottom sides
 * @param grid the grid of cells containing all words added so far
 * @returns a set of all hits and whether there are any hits on opposite sides of the word.
 */
function checkCollision(word: Word, cardinal: Direction, grid: Array<Array<number | Word>>,): SideTests {
    const xCells = word.cellSize.x;
    const yCells = word.cellSize.y;

    const p1 = new Vec2(Math.floor(word.location.x - xCells / 2), Math.ceil(word.location.y + yCells / 2))
    const p2 = new Vec2(Math.ceil(word.location.x + xCells / 2), Math.ceil(word.location.y + yCells / 2))
    const p3 = new Vec2(Math.floor(word.location.x - xCells / 2), Math.floor(word.location.y - yCells / 2))
    const p4 = new Vec2(Math.ceil(word.location.x + xCells / 2), Math.floor(word.location.y - yCells / 2))

    let side1: Set<Word>;
    let side2: Set<Word>;
    let opposite = false;
    if (cardinal < Direction.LEFT) {
        side1 = testGrid(p1, p2, grid);
        side2 = testGrid(p3, p4, grid);
    }
    else {
        side1 = testGrid(p1, p3, grid);
        side2 = testGrid(p2, p4, grid);
    }

    const collisions = side1.union(side2);
    //if the union of both sides contains hits that are not present in the other side, we have opposing hits. 
    // (if a word is fully overlapped by another word, both sides will detect the same word)
    if (side1.size !== 0 && (collisions.difference(side1).size !== 0) || 
    (side2.size !== 0 && collisions.difference(side2).size !== 0)) {
        opposite = true;
    }

    return { tests: collisions, oppositeVectors: opposite }
}

function testGrid(p1: Vec2, p2: Vec2, grid: Array<Array<Word | number>>): Set<Word> {
    const hits: Set<Word> = new Set<Word>();
    const [xStart, xEnd] = p1.x < p2.x? [p1.x, p2.x] : [p2.x, p1.x];
    const [yStart, yEnd] = p1.y < p2.y? [p1.y, p2.y] : [p2.y, p1.y];
    for (let i = xStart; i <= xEnd; ++i) {
        for (let j = yStart; j <= yEnd; ++j) {
            const index = grid[i][gridSizeY - j];
            if (typeof (index) != 'number') {
                hits.add(index)
            }
        }
    }
    return hits;
}

/**
 * Find the minimum distance word needs to move in given direction to clear given overlap
 * @param word1 word to move
 * @param word2 word to being overlapped with
 * @param overlap amount of overlap with other word
 * @param direction given direction
 * @returns vector needed to move
 */
function calculateMove(word1: Word, word2: Word, overlap: Vec4, direction: Vec2): Vec2 {
    //overlap z and w values represent side of overlap, 0 = left/down 1 = up/right

    //find the limit (minimum) of the distance needed to move in straight x and y dir to clear word being overlapped with
    //if we are not on the same side as the given direction we must add double the side length of the word being moved
    const xLim = (!!overlap.z === !!(Math.sign(direction.x) + 1)) ?
        overlap.x : word2.cellSize.x - overlap.x + word1.cellSize.x;
    const yLim = (!!overlap.w === !!(Math.sign(direction.y) + 1)) ?
        overlap.y : word2.cellSize.y - overlap.y + word1.cellSize.y;

    //calucluate what final movement vector would be if x or y value were set to xLim or yLim, respectively
    const xRes = Math.abs((yLim / direction.y) * direction.x);
    const yRes = Math.abs((xLim / direction.x) * direction.y);

    //if result value is greater than corresponding limit value, discard. we add pos/neg signs later so we can round up first
    if (xRes <= xLim) return new Vec2(xRes, yLim);
    if (yRes <= yLim) return new Vec2(xLim, yRes);
    return new Vec2(0, 0)  //should never reach this line
}
// function calculateMove(word: Word, overlap: Vec4, direction: Vec2): Vec2 {
//     //overlap z and w values represent side of overlap, 0 = left/down 1 = up/right

//     //find the limit (minimum) of the distance needed to move in straight x and y dir to clear word being overlapped with
//     //if we are not on the same side as the given direction we must add double the side length of the word being moved
//     const xLim = (!!overlap.z === !!(Math.sign(direction.x) + 1)) ?
//         overlap.x : 2 * word.cellSize.x - overlap.x;
//     const yLim = (!!overlap.w === !!(Math.sign(direction.y) + 1)) ?
//         overlap.y : 2 * word.cellSize.y - overlap.y;

//     //calucluate what final movement vector would be if x or y value were set to xLim or yLim, respectively
//     const xRes = Math.abs((yLim / direction.y) * direction.x);
//     const yRes = Math.abs((xLim / direction.x) * direction.y);

//     //if result value is greater than corresponding limit value, discard
//     if (xRes <= xLim) return new Vec2(xRes, yLim);
//     if (yRes <= yLim) return new Vec2(xLim, yRes); //TODO: return abs and convert sign in parent
//     return new Vec2(0, 0)  //should never reach this line
// }

function fillGrid(grid: Array<Array<number | Word>>, word: Word) {
    for (let i = 0; i < word.cellSize.x; ++i) {
        for (let j = 0; j < word.cellSize.y; ++j) {
            const x = Math.floor((word.location.x - word.cellSize.x / 2) + i);
            const y = Math.floor((word.location.y - word.cellSize.y / 2) + j);
            grid[x][gridSizeY - y] = word; //want 0,0 to be bottom left for ease of use
        }
    }
}

/**
 * Amount of overlap between word 1 with word 2
 * @param word1 word being moved
 * @param word2 word being overlapped with
 * @returns amount of overlap (x, y) as well as which side the overlap is on(z, w) (0 = left/down, 1 = right/up)
 */
// function findOverlap(word1: Word, word2: Word): Vec4 | null { //TODO rework overlap calculations
//     const difference = word1.location.clone().subtract(word2.location)
//     const x = word1.cellSize.x / 2 + word2.cellSize.x / 2 - Math.abs(difference.x)
//     const y = word1.cellSize.y / 2 + word2.cellSize.y / 2 - Math.abs(difference.y)

//     if (x > 0 && y > 0) {
//         const overSidex = Math.max(0, Math.sign(difference.x))
//         const overSidey = Math.max(0, Math.sign(difference.y))
//         return { x: x, y: y, z: overSidex, w: overSidey }
//     }
//     return null;
// }

function findOverlap(word1: Word, word2: Word, direction: Vec2): Vec4 | null {
    const difference = word1.location.clone().subtract(word2.location)
    let x = word1.cellSize.x / 2 - word2.cellSize.x / 2 + difference.x
    let y = word1.cellSize.y / 2 - word2.cellSize.y / 2 + difference.y

    if (Math.abs(x) <=  word2.cellSize.x && Math.abs(y) <= word2.cellSize.y) {
        x = word1.cellSize.x - x;
        y = word1.cellSize.y - y;
        
        if(Math.sign(direction.x) < 0) x -= word1.cellSize.x + word2.cellSize.x;
        if(Math.sign(direction.y) < 0) y -= word1.cellSize.y + word2.cellSize.y;
        
        const overSidex = Math.max(0, Math.sign(difference.x))
        const overSidey = Math.max(0, Math.sign(difference.y))

        return { x: Math.abs(x), y: Math.abs(y), z: overSidex, w: overSidey }
    }
    return null;
}

//get the pixel size of a text string given font size
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

function checkBounds(word: Word): boolean {
    if((word.location.x + Math.ceil(word.cellSize.x/2)) >= gridSizeX || (word.location.x - Math.ceil(word.cellSize.x/2)) < 0
    || (word.location.y + Math.ceil(word.cellSize.y/2)) >= gridSizeY || (word.location.y - Math.ceil(word.cellSize.y/2)) < 0){
        return false;
    }
    return true;
}

//debug grid to show cell locations
function drawGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = ((xDiv % 1) * cellSize) / 2;
    const yStart = ((yDiv % 1) * cellSize) / 2;

    ctx.strokeStyle = 'red';

    let i = xStart;
    while (i < canvas.width) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke();
        i += cellSize;
    }

    let j = yStart;
    while (j < canvas.height) {
        ctx.beginPath()
        ctx.moveTo(0, j)
        ctx.lineTo(canvas.width, j)
        ctx.stroke();
        j += cellSize;
    }
}

function drawFilledCells(canvas: HTMLCanvasElement, grid: Array<Array<Word | number>>) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = ((xDiv % 1) * cellSize) / 2;
    const yStart = ((yDiv % 1) * cellSize) / 2;

    ctx.fillStyle = 'steelblue';

    for (let i = 0; i < gridSizeX; ++i) {
        for (let j = 0; j < gridSizeY; ++j) {
            if (grid[i][j]) {
                const x = xStart + i * cellSize;
                const y = yStart + j * cellSize;
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }

}

function drawCurrentSpace(canvas:HTMLCanvasElement, word:Word){
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = (cellSize*Math.floor(word.location.x - word.cellSize.x/2)) + ((xDiv % 1) * cellSize) / 2;
    const yStart = (cellSize*Math.floor(gridSizeY - word.location.y + word.cellSize.y/2)) + ((yDiv % 1) * cellSize) / 2;

    ctx.fillStyle = 'gold';

    for (let i = 0; i < word.cellSize.x; ++i) {
        for (let j = 0; j < word.cellSize.y; ++j) {
            const x = xStart + i * cellSize;
            const y = yStart + j * cellSize;
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

