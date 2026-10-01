'use client'
import { useEffect, useRef, useState } from 'react'
import { Word } from '@/app/lib/classes/word';
import { incrementAngle } from '@/app/lib/utils';
import Vec2 from 'victor';
import { Helpers } from '@/app/lib/classes/helpers';
import { DebugHelpers } from '@/app/lib/classes/debugHelpers';
import { article } from '../lib/types';
import clsx from "clsx";

const sizeCategories = 7;   //the divisions of size for each word
const cellSize = 11;        //the pixel size of each cell in the grid

const debug = process.env.NEXT_PUBLIC_DEBUG === 'true';
const stepDebug = process.env.NEXT_PUBLIC_STEPDEBUG === 'true';

export default function WordCloud({ clusters, setArticles }: {
     clusters: Array<[string, number, article[]]>
     setArticles: (articles: article[]) => void; 
}) {
    if (clusters.length === 0) {
        throw new Error("No data sent to cloud builder.");
    }

    console.log("render")

    //refs needed between renders for step-by-step debugging
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef<number>(0);
    const indexRef = useRef<number>(1);
    const addedWordsRef = useRef<Array<Word>>([]);
    const gridRef = useRef<Array<Array<Word | number>>>([])
    const wordRef = useRef<Word>(null);

    const [addedWords, updateAddedWords] = useState<Word[]>([]);
    const [size, setSize] = useState(new Vec2(0, 0));

    const h = new Helpers();
    h.setSizes(size, cellSize);
    const dh = new DebugHelpers();
    dh.setSizes(cellSize, h.gridSize);

    const sorted = clusters.sort((a, b) => (b[1] - a[1]));
    const highest = sorted[0][1];
    const wordList: [string, number, article[]][] = sorted.map(([key, value, articles]) => [key, Math.pow((value / highest),1.25) * sizeCategories + 0.7, articles]);

    
    function makeWordCloud(words: Word[]): Word[] {
        const firstElem = wordList[0];
        let firstWord = h.makeWord(firstElem[0], firstElem[1], firstElem[2]);

        if (firstWord.cellSize.x > h.gridSize.x) {
            const adjustCellSize = Math.floor(size.x / firstWord.cellSize.x) - 1
            h.setSizes(size, adjustCellSize);
            dh.setSizes(adjustCellSize, h.gridSize);
            firstWord = h.makeWord(firstElem[0], firstElem[1], firstElem[2]);
        }

        firstWord.selected = true;
        if(!wordRef.current){
            firstWord.current = true;
            wordRef.current = firstWord;
            setArticles(firstWord.articles)
        }

        const wordPool: Word[] = [];
        wordPool.push(firstWord);

        h.fillGrid(firstWord);
        gridRef.current = h.grid
        
        if (!stepDebug) {
            let angle = 0;
            words.slice(1).forEach((w) => {
                const word = h.fitWord(w);
                if (!word) { console.log("could not fit word: %s", w.content); return }

                const startpos = new Vec2(word.location.x, word.location.y);
                let attemptAngle = angle

                while (attemptAngle - angle < 2 * Math.PI) {
                    if (addWord(word, attemptAngle, h)) {
                        wordPool.push(word);
                        break;
                    }
                    attemptAngle = incrementAngle(attemptAngle)
                    word.move(startpos);
                }
                angle = incrementAngle(angle);
            });
        }
        return wordPool;
    }

    //used to add one word at a time for debug purposes
    function addOne() {
        const h = new Helpers();
        const cellSize = Math.floor(size.x / gridRef.current.length)
        h.setSizes(size, cellSize)
        h.grid = gridRef.current

        if (h.grid.length === 0) {
            console.log('grid is not initialized');
            return;
        }
        const data = wordList[indexRef.current]
        const word = h.makeWord(data[0], data[1], data[2])
        if (!h.checkBounds(word)) {
            console.log('word %s was out of bounds when created: (%d, %d)', [word.content, word.location.x, word.location.y]);
            return;
        }
        const canvas = canvasRef.current
        if (!canvas) return;
        if (addWord(word, angleRef.current, h, dh, canvas)) {
            dh.fillGrid(word, gridRef.current)
            indexRef.current += 1;
            updateAddedWords(prev => [...prev, word]);
        }
        angleRef.current = incrementAngle(angleRef.current);
    }

    function handleWordClick(word: Word) {
        word.current = true;
        word.selected = true;
        if(wordRef.current){
            wordRef.current.current = false;
        }
        wordRef.current = word;
        setArticles(word.articles)
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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

        let words: Word[] = []

        if(!addedWordsRef.current.length){
            wordList.forEach(([content, value, articles]) => {
                words.push(h.makeWord(content, value, articles));
            });
        }
        else{
            words = addedWordsRef.current
        }

        addedWordsRef.current = makeWordCloud(words);
        updateAddedWords(addedWordsRef.current)
    }, [size])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || size.x === 0) return;

        if (debug) {
            canvas.width = h.elementSize.x;
            canvas.height = h.elementSize.y;

            dh.clear(canvas);
            dh.drawGrid(canvas);
            dh.drawFilledCells(canvas, gridRef.current);
        }
    }, [addedWords])

    return (
        <>
            <canvas
                ref={canvasRef}
                className='h-full w-full'
            />
            <WordCloudHTML words={addedWords} width={h.elementSize.x} height={h.elementSize.y} h={h} handleClick={handleWordClick} />
            {stepDebug && <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
                onClick={addOne}>
                Add Word</button>}
        </>
    )
}

function WordCloudHTML({ words, width, height, h, handleClick }: {
    words: Word[],
    width: number,
    height: number,
    h: Helpers,
    handleClick: (word: Word) => void
}) {
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
            return (

                <button 
                    onClick={() => handleClick(word)}
                    key={word.content} 
                    style={{
                        position: 'absolute', left: position.x, top: height - position.y,
                        font: (word.frequencyCategory * h.cellSize).toString() + 'px Arial'
                    }}
                    className={clsx(
                        'hover:underline',
                        word.selected && 'opacity-50',
                        word.current && 'opacity-100 underline'
                    )}>

                    {word.content}

                </button>
            )
        })}
    </>)
}

function addWord(word: Word, angle: number, h: Helpers, dh?: DebugHelpers, canvas?: HTMLCanvasElement): boolean {
    let attempts = 0;
    let alternate = true; //alternate is used to check each pair of opposite sides of the word for collisions
    let moved = true;

    //iteratively move word, resolving each collision until there are no more collisions or word is out of bounds
    while (attempts < 300) {
        const prev = moved;
        moved = h.moveWord(word, angle, alternate);

        if (stepDebug && dh && canvas) {
            dh.clear(canvas)
            dh.drawGrid(canvas)
            dh.drawFilledCells(canvas, h.grid)
            dh.drawCurrentSpace(canvas, word)
        }

        if (!h.checkBounds(word)) break;

        //we know there are no more collisions when the word has not moved after checking all sides for collisions
        if (!prev && !moved) {
            h.fillGrid(word);
            return true;
        }

        attempts++;
        alternate = !alternate;

    }
    return false
}