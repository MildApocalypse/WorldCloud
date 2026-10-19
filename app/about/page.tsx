import { SS4 } from "../ui/fonts";

export default function about(){
    return(
        <div className="flex-col">
            <h1 className={`${SS4.className} pl-25 text-[30px] opacity-50 md:text-[100px] `}>About</h1>
            <div className="[&>p]:mb-4 pl-15 md:w-1/2 md:pl-50">
                <p>Welcome to World Cloud, the aggregate of the world!</p>

                <p>This website orgainizes news articles of similar subject into clusters. Then by taking each article headline in a cluster and running a wieghted policy model on them, we can give the cluster a name. These names are then organized into a word cloud. The clusters containing the most articles are displayed the largest and most centrally.</p> 
                    
                <p>My initial goal with World Cloud was to create a place to find all angles on a story, rather than one filtered through a social media algorithm. On these websites, there is often an undercurrent of information not shown to me, usually for political reasons. Sometimes a story can contain key details, or corrections to a story can garner much less attention. My hope for World Cloud was for somewhere that could place these stories prominently alongside all others, equally as visible. </p>
                    
                <p>I created this site in 2026 to add to my portfolio, to show my understanding of engineering solutions. AI these days can do a lot of the work for you, but most of this project was created by hand in order to maintain my knowledge of the various systems contained within. Due to the nature of the project, it uses free APIs and is quite limited in scope, and is not intended to be a commercial product. Its primary purpose is as a proof of concept and ability. </p>
                
            </div>
        </div>
    )
}