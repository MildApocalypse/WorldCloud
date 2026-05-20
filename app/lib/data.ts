import { readFile } from "fs/promises";
import { Word } from "./types";
export async function readPlaceholder(path: string): Promise <string>
{
    try{
        const content = await readFile(path, 'utf-8');
        return content;
    }
    catch(error){
        console.log(error);
        return ' ';
    }
}

export function processText(text: string): string[]
{
    const tokens = text.toLowerCase().match(/\w+('\w+)*/g) ?? [];
    return tokens;
}
