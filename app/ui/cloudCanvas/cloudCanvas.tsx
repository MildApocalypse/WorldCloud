'use client'
import { useEffect, useRef, useState } from 'react'
import { Vec4, Direction, SideTests } from '../../lib/types';
import { Word } from '../../lib/classes';
import { makeWord, checkBounds, testGrid } from './helpers'
import { incrementAngle } from '@/app/lib/utils';
import Vec2 from 'victor';

const gridSize: Vec2 = new Vec2(0, 0);
const sizes = 7;
const cellSize = 13;

const debug = process.env.NEXT_PUBLIC_DEBUG === 'true';
const stepDebug = process.env.NEXT_PUBLIC_STEPDEBUG === 'true';

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

            gridSize.x = Math.trunc(xDiv);
            gridSize.y = Math.trunc(yDiv);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const grid = Array.from({ length: gridSize.x }, () => Array(gridSize.y).fill(0));
            gridRef.current = grid;

            wordPool = [];

            const firstElem = wordList[0];
            const firstWord = makeWord(firstElem[0], firstElem[1], cellSize, new Vec2(gridSize.x, gridSize.y));

            if(checkBounds(firstWord, gridSize)){
                wordPool.push(firstWord);
                fillGrid(grid, firstWord);
            }
            else{
                console.log('could not add first word?') //todo: make proper error system
                return;
            }
            
            if(!stepDebug){
                let angle = 0;
                wordList.slice(1).forEach(([key, value]) => {

                    const word = makeWord(key, value, cellSize, gridSize) ;
                    
                    if(!checkBounds(word, gridSize)){ 
                        console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
                        return;
                    }
                    if(addWord(word, grid, angle)){
                        wordPool.push(word);
                    }
                    angle = incrementAngle(angle);
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
                makeWordCloud();
                setSize({ width: canvas.width, height: canvas.height });
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
        const word = makeWord(pair[0], pair[1], cellSize, gridSize)
        let success = false;
        if(!checkBounds(word, gridSize)){ 
            console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
            return;
        }
        if(success = addWord(word, gridRef.current, angleRef.current, canvasRef.current)){
            fillGrid(gridRef.current, word)
            indexRef.current += 1;
        }
        if(success){
            updateAddedWords(prev => [...prev, word]);
            if(debug&&canvasRef.current&&gridRef.current){
                drawGrid(canvasRef.current);
                drawFilledCells(canvasRef.current, gridRef.current);
                drawAngle(canvasRef.current, angleRef.current, addedWords[0].location);
            }
        }
        angleRef.current = incrementAngle(angleRef.current);
    }

    return (
        <div className="relative w-full h-screen">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
            <WordCloudHTML words={addedWords} width={size.width} height={size.height} />
            {stepDebug && <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
            onClick={addOne}>
                Add Word</button>}
        </div>
    )
}

function WordCloudHTML({ words, width, height }: { words: Array<Word>, width: number, height: number }) {
    const ratio: Vec2 = new Vec2(width / gridSize.x, height / gridSize.y);

    function convert(word: Word): Vec2 {
        // (X/2)%1 adds 0.5 if word is odd number, needed in order to find true middle
        const xEven = 1 - word.cellSize.x%2;
        const yEven = 1 - word.cellSize.y%2;
        const x = ((word.location.x + xEven + (word.cellSize.x/2)%1) * ratio.x) - (word.size.x / 2);
        const y = ((word.location.y + yEven + (word.cellSize.y/2)%1) * ratio.y) + (word.size.y / 2);
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

function addWord(word: Word, grid: Array<Array<number|Word>>, angle: number, canvas?: HTMLCanvasElement | null): boolean{
    let attempts = 0;
    let alternate = true;
    let moved = true;

    while (attempts < 300) {
        const prev = moved;
        moved = moveWord(grid, word, angle, alternate);
        if(!checkBounds(word, gridSize)) break;
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
            if(overlap){
                const newVector = calculateMove(overlap, direction);
                pushVector = pushVector.length() > newVector.length() ? pushVector : newVector;
            }
        }
    }
    if (pushVector.isEqualTo(new Vec2(0, 0))) {
        return false
    }
    word.move(new Vec2(Math.round(pushVector.x)*Math.sign(direction.x), Math.round(pushVector.y)*Math.sign(direction.y)));
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
    const p1 = new Vec2(word.xSpan[0], word.ySpan[1])
    const p2 = new Vec2(word.xSpan[1], word.ySpan[1])
    const p3 = new Vec2(word.xSpan[0], word.ySpan[0])
    const p4 = new Vec2(word.xSpan[1], word.ySpan[0])

    let side1: Set<Word>;
    let side2: Set<Word>;
    if (cardinal < Direction.LEFT) {
        side1 = testGrid(p1, p2, grid, gridSize);
        side2 = testGrid(p3, p4, grid, gridSize);
    }
    else {
        side1 = testGrid(p1, p3, grid, gridSize);
        side2 = testGrid(p2, p4, grid, gridSize);
    }

    const collisions = side1.union(side2);

    return { tests: collisions }
}

/**
 * Find the minimum distance word needs to move in given direction to clear given overlap
 * @param overlap amount of overlap with other word
 * @param direction given direction
 * @returns vector needed to move
 */
function calculateMove(overlap: Vec4, direction: Vec2): Vec2 {
    
    const xLim = overlap.x;
    const yLim = overlap.y;

    //calucluate what final movement vector would be if x or y value were set to xLim or yLim, respectively
    const xRes = Math.abs((yLim / direction.y) * direction.x);
    const yRes = Math.abs((xLim / direction.x) * direction.y);

    //if result value is greater than corresponding limit value, discard. we add pos/neg signs later so we can round up first
    return (xRes <= xLim)? new Vec2(xRes, yLim) : new Vec2(xLim, yRes);
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

function fillGrid(grid: Array<Array<number | Word>>, word: Word) {
    for (let i = 0; i < word.cellSize.x; ++i) {
        for (let j = 0; j < word.cellSize.y; ++j) {
            const x = word.xSpan[0] + i;
            const y = word.ySpan[0] + j;
            grid[x][gridSize.y - y - 1] = word; //want 0,0 to be bottom left for ease of use
        }
    }
}

/* ============== DEBUG DRAW FUNCTIONS ================ */

function drawGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = ((xDiv % 1) * cellSize) / 2;
    const yStart = ((yDiv % 1) * cellSize) / 2;

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;

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

    for (let i = 0; i < gridSize.x; ++i) {
        for (let j = 0; j < gridSize.y; ++j) {
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

    const xStart = (cellSize*Math.floor(word.xSpan[0])) + ((xDiv % 1) * cellSize) / 2;
    const yStart = canvas.height - (cellSize*Math.floor(word.ySpan[0] + 1)) - ((yDiv % 1) * cellSize) / 2;

    ctx.fillStyle = 'gold';

    for (let i = 0; i < word.cellSize.x; ++i) {
        for (let j = 0; j < word.cellSize.y; ++j) {
            const x = xStart + i * cellSize;
            const y = yStart - j * cellSize;
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

function drawAngle(canvas: HTMLCanvasElement, angle: number, center: Vec2){
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = (cellSize*Math.floor(center.x + 1)) + ((xDiv % 1) * cellSize) / 2;
    const yStart = canvas.height - (cellSize*Math.floor(center.y + 1)) - ((yDiv % 1) * cellSize) / 2;

    const xEnd = xStart + Math.cos(angle) * 500;
    const yEnd = yStart - Math.sin(angle) * 500;

    ctx.strokeStyle = 'lightcoral';
    ctx.lineWidth = 5;

    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

