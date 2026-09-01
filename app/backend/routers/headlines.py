from fastapi import APIRouter
from database.article_access import download_articles

router = APIRouter(prefix="/api")

@router.get("/tests")
def get_tests():
    return [
        [[10, ["test phrase", 1.0]]],
        [[5, ["hello world", 0.8]]]
    ]

@router.get("/headlines")
async def get_headlines():
    return download_articles()