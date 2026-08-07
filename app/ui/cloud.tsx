import CloudCanvas from "./cloudCanvas";
import { getData } from "../lib/data";

export default async function WordCloud() {
    const tokens = await getData();
    return (
        <>
            <CloudCanvas tokens={tokens} />
        </>
    );
}



