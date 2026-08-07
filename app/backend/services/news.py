import requests
import os

def get_trending_articles(query):
    response = requests.get("https://newsapi.org/v2/everything", 
    params={
        "q": query,
        "apiKey": os.getenv("NEWS_API_KEY"),
        "language": "en",
        "sortBy": "publishedAt",
    })
    return response.json().get("articles", [])