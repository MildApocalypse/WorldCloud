def check_required(article):
    if not article.get("title") or not article.get("description") or not article.get("author"):
        return False
    if "[Removed]" in article["title"]:
        return False
    if len(article["title"]) < 15:
        return False
    return True

def filter_spam(articles):
    print("removing duplicates")
    articles.sort(key=lambda article: article["title"])

    filtered_articles = process_removal(articles, "title")
    print("num of articles: " + str(len(filtered_articles)))

    articles = filtered_articles

    print("removing sequentials")
    articles.sort(key=lambda article: article["publishedAt"])
    
    filtered_articles = process_removal(articles, "author")
    print("num of articles: " + str(len(filtered_articles)))

    return filtered_articles


def process_removal(articles, feature):
    filtered_articles = [articles[0]]
    for i, a in enumerate(articles[1:], start=1):
            if articles[i-1].get(feature) != a.get(feature):
                filtered_articles.append(a)

    return filtered_articles
    

