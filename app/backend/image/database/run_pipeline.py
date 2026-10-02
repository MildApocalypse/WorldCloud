from services.news import get_trending_articles
from utils.filter_article import check_required, filter_spam
from utils.term_grouping import group_terms, agglomerate_clusters
from utils.process_cluster import process_clusters
from database.article_access import upload_articles
from pathlib import Path
import json

def run_pipeline(test: bool, upload: bool) ->list:
    queries = ["business", "entertainment", "general", "health", "science", "sports", "technology"]
    all_articles = []
    
    if test:
        script_dir = Path(__file__).parent
        json_path = (script_dir / ".." / "testfiles" / "test_dupes.json").resolve()
        with open(json_path) as f:
            all_articles = json.load(f).get("articles", [])
            print(all_articles)
    else: 
        for q in queries:
            data = get_trending_articles(q)
            if data == []:
                 print("no articles returned")
                 return
    
            all_articles.extend(data)

    print("initial num of articles: " + str(len(all_articles)))
    
    print("checking required features")
    all_articles = [a for a in all_articles if check_required(a)]
    print("num of articles: " + str(len(all_articles)))

    all_articles = filter_spam(all_articles)


    print("making clusters...")
    article_clusters = agglomerate_clusters(all_articles)

    print("keybert analysis...")
    results = group_terms("keybert", article_clusters)

    print("processing clusters")
    results = process_clusters(results)

    for c in results:
        print(c[len(c)-1])

    if not test and upload:
        print("uploading articles")
        upload_articles(results)
    
    return results