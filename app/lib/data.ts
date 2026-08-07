import { readFile } from "fs/promises";


const placeHolders = process.env.NEXT_PUBLIC_PLACEHOLDERWORDS === 'true';

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

export async function getData(): Promise<Map<string, number>> {
    const freq: Map<string, number> | null = new Map<string, number>();

    if(placeHolders){
        const text = await readPlaceholder("app/data/placeholdertext.txt");
        const tokens = processText(text);
        for(const t of tokens){
            freq.set(t, (freq.get(t)?? 0) + 1)
        }
    }
    else{
        try{
            console.log("Awaiting data fetch")
            const res = await fetch("http://localhost:8000/api/headlines")
            const data: [[...unknown[], [number, [string, number]]]] = await res.json()
            console.log(data)
            
            for(const h of data){
                const pair = (h as [...unknown[], [number, [string, number]]]).at(-1) as [number, [string, number]]
                
                freq.set(pair[1][0][0], pair[0])
            }

        }catch{
            throw new Error("Data fetch failed.")
        }
    }
    return freq;
}
