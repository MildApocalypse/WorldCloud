from fastapi import APIRouter
from database.run_pipeline import run_pipeline
from database.article_access import download_articles

router = APIRouter(prefix="/api")

@router.get("/headlines")
async def get_headlines():
    run_pipeline()
    return download_articles()