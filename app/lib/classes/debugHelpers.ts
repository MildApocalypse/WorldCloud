import { Word } from "./word";
import Vec2 from 'victor'

export class DebugHelpers {
    cellSize: number
    gridSize: Vec2
    
    constructor(){
        this.cellSize = 0;
        this.gridSize = new Vec2(0, 0);
    }

    setSizes(cellSize: number, gridSize: Vec2){
        this.cellSize = cellSize;
        this.gridSize = gridSize;
    }

    drawGrid(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return

        const xDiv = canvas.width / this.cellSize;
        const yDiv = canvas.height / this.cellSize;

        const xStart = ((xDiv % 1) * this.cellSize) / 2;
        const yStart = ((yDiv % 1) * this.cellSize) / 2;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        let i = xStart;
        while (i < canvas.width) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, canvas.height)
            ctx.stroke();
            i += this.cellSize;
        }

        let j = yStart;
        while (j < canvas.height) {
            ctx.beginPath()
            ctx.moveTo(0, j)
            ctx.lineTo(canvas.width, j)
            ctx.stroke();
            j += this.cellSize;
        }
    }

    drawFilledCells(canvas: HTMLCanvasElement, grid: Array<Array<Word | number>>) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return

        const xDiv = canvas.width / this.cellSize;
        const yDiv = canvas.height / this.cellSize;

        const xStart = ((xDiv % 1) * this.cellSize) / 2;
        const yStart = ((yDiv % 1) * this.cellSize) / 2;

        ctx.fillStyle = 'steelblue';

        for (let i = 0; i < this.gridSize.x; ++i) {
            for (let j = 0; j < this.gridSize.y; ++j) {
                if (grid[i][j]) {
                    const x = xStart + i * this.cellSize;
                    const y = yStart + j * this.cellSize;
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }

    }

    drawCurrentSpace(canvas: HTMLCanvasElement, word: Word) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return

        const xDiv = canvas.width / this.cellSize;
        const yDiv = canvas.height / this.cellSize;

        const xStart = (this.cellSize * Math.floor(word.xSpan[0])) + ((xDiv % 1) * this.cellSize) / 2;
        const yStart = canvas.height - (this.cellSize * Math.floor(word.ySpan[0] + 1)) - ((yDiv % 1) * this.cellSize) / 2;

        ctx.fillStyle = 'gold';

        for (let i = 0; i < word.cellSize.x; ++i) {
            for (let j = 0; j < word.cellSize.y; ++j) {
                const x = xStart + i * this.cellSize;
                const y = yStart - j * this.cellSize;
                ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawAngle(canvas: HTMLCanvasElement, angle: number, center: Vec2) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return

        const xDiv = canvas.width / this.cellSize;
        const yDiv = canvas.height / this.cellSize;

        const xStart = (this.cellSize * Math.floor(center.x + 1)) + ((xDiv % 1) * this.cellSize) / 2;
        const yStart = canvas.height - (this.cellSize * Math.floor(center.y + 1)) - ((yDiv % 1) * this.cellSize) / 2;

        const xEnd = xStart + Math.cos(angle) * 500;
        const yEnd = yStart - Math.sin(angle) * 500;

        ctx.strokeStyle = 'lightcoral';
        ctx.lineWidth = 5;

        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
    }

}