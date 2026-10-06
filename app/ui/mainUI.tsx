'use client'

import WordCloud from "./wordCloud";
import LinksPanel from "./linksPanel";
import Toggle from "./toggle";
import { article } from "../lib/types";
import { useState } from "react";
import { SS4 } from "./fonts";


export default function MainUI({clusters}: {clusters: [string, number, article[]][]}) {
    const [articles, setArticles] = useState<article[]>([])
    const [on, setOn] = useState(false);

    return (
        <>
            <div className="h-full px-5 w-4/5 flex flex-col">
                <h1 className={`${SS4.className} text-[100px] opacity-50`}>World Cloud</h1>
                <div className="relative flex-1 min-h-0 overflow-hidden">
                    <WordCloud clusters={clusters} setArticles={setArticles}/>
                </div>
            </div>
            <div className="py-3 w-1/5 flex flex-col border-l-2 border-l-blue-200/50">
                <div className="pb-3 border-b-2 border-b-blue-200/50 flex items-center gap-3">
                    <Toggle checked={on} onChange={setOn}/>
                </div>
                <div className="px-5 h-screen overflow-y-auto">
                    <LinksPanel articles={articles} tabOpen={on}/>
                </div>
            </div>
        </>
    );
}



