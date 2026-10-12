/* eslint-disable @next/next/no-img-element */
import { article } from "../lib/types";

export default function LinksPanel({ articles, tabOpen}: {articles: article[], tabOpen: boolean} ){
    
    return (
        <>
            {articles.map((a) =>{
                const domainString = getDomain(a.url);
                let favicon = null;
                if(domainString) favicon = getFaviconUrl(domainString);
                return(
                    <div key={a.title} className="py-1 
                    max-md:max-w-[85vw] max-md:shrink-0 max-md:min-w-75 
                    md:py-5">
                        <div className="block">
                            <a 
                                href={a.url} 
                                target={tabOpen? "_blank" : undefined} rel={tabOpen? "noopener noreferrer" : undefined} 
                                className="hover:underline font-[Arial] text-[14px] md:text-[18px]">
                                
                                {a.imageUrl && <img 
                                    src={a.imageUrl} 
                                    onError={(e)=>{
                                        const img = e.currentTarget
                                        img.onerror = null
                                        img.src = "/images/no-thumb.png"}} 
                                    alt="" 
                                    className="float-left mr-3 w-18 md:w-24" 
                                    loading="lazy">
                                </img>}
                                {a.title}
                            </a>
                        </div>
                        {favicon && <img className="inline rounded" src={favicon} alt="" width={18} height={18}></img>}
                        {domainString && <a className="px-1" style={{font: '13px Arial'}}>{domainString}</a>}
                    </div>
                )
            })}
        </>
    )
}

function getDomain(urlString: string): string | null {
    try {
      const url = new URL(urlString);
      return url.hostname; 
    } catch {
      return "";
    }
}

function getFaviconUrl(urlString: string, size: number = 64): string | null {
    try {
        return `https://www.google.com/s2/favicons?domain=${urlString}&sz=${size}`;
    } catch {
        return ""
    }
}