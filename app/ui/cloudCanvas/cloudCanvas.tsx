'use client'
import { useEffect, useRef, useState } from 'react'
import { HookHelpers } from '../../lib/types';
import { Word } from '../../lib/classes';
import { incrementAngle } from '@/app/lib/utils';
import Vec2 from 'victor';
import { useHelperHook } from './helpers';


const gridSize: Vec2 = new Vec2(0, 0);
let canvasSize: Vec2 = new Vec2(0, 0);
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
    
    const [addedWords, updateAddedWords] = useState<Word[]>([]);
    const [size, setSize] = useState(new Vec2(0,0));
    const h = useHelperHook();
    h.setSize(size, cellSize);
    
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
            canvasSize = new Vec2(canvas.width, canvas.height);
            h.setSize(canvasSize, cellSize)

            wordPool = [];

            const firstElem = wordList[0];
            const firstWord = h.makeWord(firstElem[0], firstElem[1], cellSize);

            if(h.checkBounds(firstWord)){
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

                    const word = h.makeWord(key, value, cellSize) ;
                    
                    if(!h.checkBounds(word)){ 
                        console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
                        return;
                    }
                    if(addWord(word, grid, angle, h)){
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
                setSize(canvasSize);
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
        const word = h.makeWord(pair[0], pair[1], cellSize)
        if(!h.checkBounds(word)){ 
            console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
            return;
        }
        if(addWord(word, gridRef.current, angleRef.current, h, canvasRef.current)){
            fillGrid(gridRef.current, word)
            indexRef.current += 1;
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
            <WordCloudHTML words={addedWords} width={canvasSize.x} height={canvasSize.y} />
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
        const xEven = 1 - word.cellSize.x % 2;
        const yEven = 1 - word.cellSize.y % 2;
        const x = ((word.location.x + xEven + (word.cellSize.x / 2) % 1) * ratio.x) - (word.size.x / 2);
        const y = ((word.location.y + yEven + (word.cellSize.y / 2) % 1) * ratio.y) + (word.size.y / 2);
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

function addWord(word: Word, grid: Array<Array<number | Word>>, angle: number, h: HookHelpers,
     canvas?: HTMLCanvasElement | null): boolean {
    let attempts = 0;
    let alternate = true;
    let moved = true;

    while (attempts < 300) {
        const prev = moved;
        moved = h.moveWord(grid, word, angle, alternate);
        if (!h.checkBounds(word)) break;
        if (canvas) {
            drawGrid(canvas)
            drawFilledCells(canvas, grid);
            drawCurrentSpace(canvas, word);
        }
        if (!prev && !moved) {
            fillGrid(grid, word);
            return true;
        }
        attempts++;
        alternate = !alternate;
    }
    return false
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

function drawCurrentSpace(canvas: HTMLCanvasElement, word: Word) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = (cellSize * Math.floor(word.xSpan[0])) + ((xDiv % 1) * cellSize) / 2;
    const yStart = canvas.height - (cellSize * Math.floor(word.ySpan[0] + 1)) - ((yDiv % 1) * cellSize) / 2;

    ctx.fillStyle = 'gold';

    for (let i = 0; i < word.cellSize.x; ++i) {
        for (let j = 0; j < word.cellSize.y; ++j) {
            const x = xStart + i * cellSize;
            const y = yStart - j * cellSize;
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

function drawAngle(canvas: HTMLCanvasElement, angle: number, center: Vec2) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return

    const xDiv = canvas.width / cellSize;
    const yDiv = canvas.height / cellSize;

    const xStart = (cellSize * Math.floor(center.x + 1)) + ((xDiv % 1) * cellSize) / 2;
    const yStart = canvas.height - (cellSize * Math.floor(center.y + 1)) - ((yDiv % 1) * cellSize) / 2;

    const xEnd = xStart + Math.cos(angle) * 500;
    const yEnd = yStart - Math.sin(angle) * 500;

    ctx.strokeStyle = 'lightcoral';
    ctx.lineWidth = 5;

    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}



