import { readPlaceholder, processText } from "../lib/data";
import CloudCanvas from "./cloudCanvas";
import { WordFreq } from '../lib/types';

export default async function WordCloud() {
    const text = await readPlaceholder('app/data/placeholdertext.txt');
    const tokens = processText(text);
    const freq = new Map<string, number>();

    for (const t of tokens) {
        freq.set(t, (freq.get(t) ?? 0) + 1);
    }

    return (<><CloudCanvas tokens={freq}/></>);
}