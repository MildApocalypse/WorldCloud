import Vec2 from 'victor'
import { getRange } from './utils'

export class Word{
    content: string
    size: Vec2//pixel size
    cellSize: Vec2 //cell size
    frequencyCategory: number //class of frequency
    location: Vec2 //cell coordinates
    xSpan: [number, number] //0 - left, 1 - right
    ySpan: [number, number] //0 - bottom, 1 - top

    constructor(content: string, size: Vec2, cellSize: Vec2, freq: number, loc: Vec2 ){
        this.content = content;
        this.size = size;
        this.cellSize = cellSize;
        this.frequencyCategory = freq;
        this.location = loc;
        this.xSpan = getRange(this.location.x, this.cellSize.x);
        this.ySpan = getRange(this.location.y, this.cellSize.y);
    }

    move(vector: Vec2){
        this.location.add(vector);
        this.xSpan = getRange(this.location.x, this.cellSize.x);
        this.ySpan = getRange(this.location.y, this.cellSize.y);
    }
}