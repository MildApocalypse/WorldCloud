from fastapi import APIRouter
from server.download.download_articles import download_articles

router = APIRouter(prefix="/api")

@router.get("/tests")
async def get_tests():
    return [
        [[10, ["test phrase", 1.0]]],
        [[9, ["very long very big incredibly long test phrase hello", 1.0]]],
        [[5, ["hello world", 0.8]]]
    ]

@router.get("/headlines")
async def get_headlines():
    results = download_articles()
    for c in results:
        print(c[len(c)-1])
    return results