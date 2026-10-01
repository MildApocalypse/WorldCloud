import requests
import os

from dotenv import load_dotenv

load_dotenv()

def get_trending_articles(query):
    response = requests.get("https://newsapi.org/v2/everything", 
    params={
        "q": query,
        "apiKey": os.environ["NEWS_API_KEY"],
        "language": "en",
        "sortBy": "publishedAt",
    })
    res_json = response.json()
    if(res_json.get('status') == 'error'):
        print('code: ' + res_json.get('code'))
        print('message: ' + res_json.get('message'))
        return([])
    
    return response.json().get("articles", [])