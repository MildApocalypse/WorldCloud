import { readFile } from "fs/promises";
import { article } from "./types";


const placeHolders = process.env.NEXT_PUBLIC_PLACEHOLDERWORDS === 'true';
const API_BASE = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";

export async function readPlaceholder(path: string): Promise <string>
{
    try{
        const content = await readFile(path, 'utf-8');
        return content;
    }
    catch{
        throw new Error("Could not read file")
    }
}

export function processText(text: string): string[]
{
    const tokens = text.toLowerCase().match(/\w+('\w+)*/g) ?? [];
    return tokens;
}

export async function getData(): Promise<Array<[string, number, Array<article>]>> {
    const freq: Map<string, number> | null = new Map<string, number>();
    let result: [string, number, article[]][] = [];

    if(placeHolders){
        const text = await readPlaceholder("app/data/placeholdertext.txt");
        const tokens = processText(text);
        for(const t of tokens){
            freq.set(t, (freq.get(t)?? 0) + 1)
        }
        result = Array.from(freq, ([key, value]) => [key, value, []])
    }
    else{
        try{
            console.log("Awaiting data fetch")
            const res = await fetch(`${API_BASE}/api/headlines`)
            const data: [[...article[], [number, [string, number]]]] = await res.json()
            
            for(const h of data){
                const pair = (h as [...article[], [number, [string, number]]]).at(-1) as [number, [string, number]]
                const articles: article[] = []

                for (const a of h.slice(0, -1)){
                    const art = a as article;
                    if(art.imageUrl === "" || !art.imageUrl){
                        art.imageUrl = "/images/no-thumb.png"
                    }
                    articles.push(art);
                }

                freq.set(pair[1][0], pair[0])
                result.push([pair[1][0], pair[0], articles])
            }
        }catch{
            throw new Error("Data fetch failed.")
        }
    }
    return result;
}
