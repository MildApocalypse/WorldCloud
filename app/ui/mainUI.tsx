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
            <div className="px-5 flex flex-col w-full
            max-md:flex-1 max-md:min-h-0
            md:h-full md:w-4/5">
                <h1 className={`${SS4.className} text-[50px] opacity-50 md:text-[100px] `}>World Cloud</h1>
                <div className="relative min-h-0 flex-1 overflow-hidden">
                    <WordCloud clusters={clusters} setArticles={setArticles}/>
                </div>
            </div>
            <div className="py-1 flex flex-col
            max-md:border-t-2 max-md:border-t-blue-200/50 
            md:h-full md:w-1/5 md:border-l-2 md:border-l-blue-200/50 md:py-3">
                <div className="pb-1 border-b-2 border-b-blue-200/50 flex items-center gap-3 md:pb-3">
                    <Toggle checked={on} onChange={setOn}/>
                </div>
                <div className="px-5 w-full flex 
                max-md:overflow-x-auto 
                md:flex-col md:flex-1 md:overflow-y-auto">
                    <LinksPanel articles={articles} tabOpen={on}/>
                </div>
            </div>
        </>
    );
}



