'use client'

import WordCloud from "./WordCloud";
import LinksPanel from "./linksPanel";
import { article } from "../lib/types";
import { useState } from "react";
import { SS4 } from "./fonts";


export default function MainUI({clusters}: {clusters: [string, number, article[]][]}) {
    const [articles, setArticles] = useState<article[]>([])

    return (
        <>
            <div className="w-4/5">
                <h1 className={`${SS4.className} text-[100px] opacity-50`}>World Cloud</h1>
                <div className="relative h-screen">
                    <WordCloud clusters={clusters} setArticles={setArticles}/>
                </div>
            </div>
            <div className="py-30  w-1/5">
                <LinksPanel articles={articles}/>
            </div>
        </>
    );
}



