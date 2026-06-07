import CloudCanvas from "./cloudCanvas/cloudCanvas";
import { processText, readPlaceholder } from "../lib/data";

export default async function WordCloud() {
    const tokens = await getData();

    return (
        <>
            <CloudCanvas tokens={tokens} />
        </>
    );
}

async function getData(): Promise<Map<string, number>> {
    const text = await readPlaceholder('app/data/placeholdertext.txt');
    const tokens = processText(text);
    const freq = new Map<string, number>();

    for (const t of tokens) {
        freq.set(t, (freq.get(t) ?? 0) + 1);
    }

    return freq;
}