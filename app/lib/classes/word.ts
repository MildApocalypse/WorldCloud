import Vec2 from 'victor'
import { getRange } from '../utils'
import { article } from '../types'
export class Word{
    content: string
    articles: article[]
    size: Vec2//pixel size
    cellSize: Vec2 //cell size
    frequencyCategory: number //class of frequency
    location: Vec2 //cell coordinates
    xSpan: [number, number] //0 - left, 1 - right
    ySpan: [number, number] //0 - bottom, 1 - top
    selected: boolean
    current: boolean

    constructor(content: string, articles: article[], size: Vec2, cellSize: Vec2, freq: number, loc: Vec2 ){
        this.content = content;
        this.articles = articles;
        this.size = size;
        this.cellSize = cellSize;
        this.frequencyCategory = freq;
        this.location = loc;
        this.xSpan = getRange(this.location.x, this.cellSize.x);
        this.ySpan = getRange(this.location.y, this.cellSize.y);
        this.selected = false;
        this.current = false;
    }

    move(vector: Vec2){
        this.location = vector;
        this.xSpan = getRange(this.location.x, this.cellSize.x);
        this.ySpan = getRange(this.location.y, this.cellSize.y);
    }
}