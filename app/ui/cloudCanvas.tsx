'use client'
import { useEffect, useRef, useState } from 'react'
import { Word } from '@/app/lib/classes/word';
import { incrementAngle } from '@/app/lib/utils';
import Vec2 from 'victor';
import { Helpers } from '@/app/lib/classes/helpers';
import { DebugHelpers } from '@/app/lib/classes/debugHelpers';

const sizeCategories = 7;   //the divisions of size for each word
const cellSize = 13;        //the pixel size of each cell in the grid

const debug = process.env.NEXT_PUBLIC_DEBUG === 'true';
const stepDebug = process.env.NEXT_PUBLIC_STEPDEBUG === 'true';

export default function CloudCanvas({ tokens }: { tokens: Map<string, number> }) {
    if (tokens.size === 0) {
        console.log("tokens empty")
        throw new Error("No data sent to cloud builder.");
    }

    console.log("render")
    //refs needed between renders for step-by-step debugging
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef<number>(0);
    const indexRef = useRef<number>(1);
    const addedWordsRef = useRef<Array<Word>>([]);


    //added words is mainly needed for the step-by-step debugger to trigger a rerender when a new word is added, 
    //but is also used by the production code for convenience
    const [addedWords, updateAddedWords] = useState<Word[]>([]);
    const [size, setSize] = useState(new Vec2(0, 0));

    const h = new Helpers();
    h.setSizes(size, cellSize);
    const dh = new DebugHelpers();
    dh.setSizes(cellSize, h.gridSize);

    const sorted = [...tokens.entries()].sort((a, b) => (b[1] - a[1]));
    const highest = sorted[0][1];
    const wordList: [string, number][] = [...sorted].map(([key, value]) => [key, Math.trunc(value / highest * sizeCategories - 0.000000001 + 1)]);
    
    const firstElem = wordList[0];
    let firstWord = h.makeWord(firstElem[0], firstElem[1]);

    if (firstWord.cellSize.x > h.gridSize.x) {
        const adjustCellSize = Math.floor(size.x / firstWord.cellSize.x) - 1
        h.setSizes(size, adjustCellSize);
        dh.setSizes(adjustCellSize, h.gridSize);
        firstWord = h.makeWord(firstElem[0], firstElem[1]);
    }

    function makeWordCloud(): Word[] {
        const wordPool: Word[] = [];

        if (!h.checkBounds(firstWord)) {
            throw new Error("First word out of bounds")
        }
        wordPool.push(firstWord);
        h.fillGrid(h.grid, firstWord);

        if (!stepDebug) {
            let angle = 0;
            wordList.slice(1).forEach(([key, value]) => {

                const word = h.makeWord(key, value);

                if (!h.checkBounds(word)) {
                    throw new Error('word \"' + word.content + '\" was out of bounds when created: (' + word.location.x + ', ' + word.location.y + ')')
                }
                if (addWord(word, h.grid, angle, h, dh)) {
                    wordPool.push(word);
                }
                angle = incrementAngle(angle);
            });
        }


        return wordPool;
    }

    //used to add one word at a time for debug purposes
    function addOne() {
        if (h.grid.length === 0) {
            console.log('grid is not initialized');
            return;
        }
        const pair = wordList[indexRef.current]
        const word = h.makeWord(pair[0], pair[1])
        if (addWord(word, h.grid, angleRef.current, h, dh, canvasRef.current)) {
            h.fillGrid(h.grid, word)
            indexRef.current += 1;
            updateAddedWords(prev => [...prev, word]);
            if (debug && canvasRef.current && h.grid) {
                dh.drawGrid(canvasRef.current);
                dh.drawFilledCells(canvasRef.current, h.grid);
                dh.drawAngle(canvasRef.current, angleRef.current, addedWords[0].location);
            }
        }
        angleRef.current = incrementAngle(angleRef.current);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !tokens.size) return;

        let resizeTimer = setTimeout(() => { return });
        const observer = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('res')
                setSize(new Vec2(canvas.offsetWidth, canvas.offsetHeight));
            }, 100);
        });
        observer.observe(canvas);

        return () => observer.disconnect();
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || size.x === 0) return;

        addedWordsRef.current = makeWordCloud();
        updateAddedWords(addedWordsRef.current)
    }, [size])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || size.x === 0) return;
        
        if (debug) {
            dh.drawGrid(canvas);
            dh.drawFilledCells(canvas, h.grid);
        }
    }, [addedWords])

    return (
        <div className="relative h-full">
            <canvas
                ref={canvasRef}
                className="w-full h-4/5"
            />
            <WordCloudHTML words={addedWords} width={h.elementSize.x} height={h.elementSize.y} h={h} />
            {stepDebug && <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
                onClick={addOne}>
                Add Word</button>}
        </div>
    )
}

function WordCloudHTML({ words, width, height, h }: { words: Word[], width: number, height: number, h: Helpers }) {
    const ratio: Vec2 = new Vec2(width / h.gridSize.x, height / h.gridSize.y);

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
                font: (word.frequencyCategory * h.cellSize).toString() + 'px Arial'
            }}>
                {word.content}
            </p>
            )
        })}
    </>)
}

function addWord(word: Word, grid: Array<Array<number | Word>>, angle: number, h: Helpers, dh: DebugHelpers,
    canvas?: HTMLCanvasElement | null): boolean {
    let attempts = 0;
    let alternate = true;
    let moved = true;

    while (attempts < 300) {
        const prev = moved;
        moved = h.moveWord(word, angle, alternate);
        if (!h.checkBounds(word)) break;
        if (canvas) {
            dh.drawGrid(canvas)
            dh.drawFilledCells(canvas, grid);
            dh.drawCurrentSpace(canvas, word);
        }
        if (!prev && !moved) {
            h.fillGrid(grid, word);
            return true;
        }
        attempts++;
        alternate = !alternate;
    }
    return false
}