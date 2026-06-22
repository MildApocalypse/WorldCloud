import CloudCanvas from "./cloudCanvas";
import { Term } from "@/app/lib/types";
import { readPlaceholder, processText } from "../lib/data";


const placeHolders = process.env.NEXT_PUBLIC_PLACEHOLDERWORDS === 'true';

export default async function WordCloud() {
    const tokens = await getData();
    return (
        <>
            <CloudCanvas tokens={tokens} />
        </>
    );
}

async function getData(): Promise<Map<string, number>> {
    let freq: Map<string, number> | null = new Map<string, number>();

    if(placeHolders){
        const text = await readPlaceholder("app/data/placeholdertext.txt");
        const tokens = processText(text);
        for(const t of tokens){
            freq.set(t, (freq.get(t)?? 0) + 1)
        }
    }
    else{
        try{
            await fetch("http://localhost:8000/api/trends")
                .then(res => res.json())
                .then((data: Term[]) => freq = parse(data));
        }catch{
            throw new Error("Data fetch failed.")
        }
    }
    return freq;
}

function parse(data: Term[]): Map<string, number>|null{
    const freq = new Map<string, number>();
    if(data){
        for (const t of data) {
            freq.set(t.phrase, (freq.get(t.phrase) ?? 0) + 1);
        }
        return freq;
    }
    return null
}