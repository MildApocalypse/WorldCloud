from fastapi import APIRouter
from services.news import get_trending_articles
from utils.filter_article import check_required, filter_spam
from utils.term_grouping import group_terms, agglomerate_clusters
from database.article_access import upload_articles, download_articles, connection_test

router = APIRouter(prefix="/api")

@router.get("/headlines")
async def get_headlines():
    if not(connection_test()):
            return None
    
    queries = ["business", "entertainment", "general", "health", "science", "sports", "technology"]
    all_articles = []
    for q in queries:
        data = get_trending_articles(q)
        all_articles.extend(data)

    print("checking required features")
    all_articles = [a for a in all_articles if check_required(a)]
    print("num of articles: " + str(len(all_articles)))

    all_articles = filter_spam(all_articles)
    
    print("making clusters...")
    article_clusters = agglomerate_clusters(all_articles)

    print("keybert analysis")
    results = group_terms("keybert", article_clusters)
    print(results)

    print("uploading")
    upload_articles(results)

    print("downloading")
    results = download_articles()
    
    return results