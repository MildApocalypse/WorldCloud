from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from server.download.download_articles import download_articles

router = APIRouter(prefix="/api")

@router.get("/manualtests")
async def get_tests():
    return [
        [[10, ["test phrase", 1.0]]],
        [[9, ["very long very big incredibly long test phrase hello", 1.0]]],
        [[5, ["hello world", 0.8]]]
    ]

TEST_FILES_DIR = (Path(__file__).parent / ".." / ".." / "testfiles").resolve()

@router.get("/printouttests/{printout_name}")
def get_printout(printout_name: str):
    file_path = (TEST_FILES_DIR / f"{printout_name}.json").resolve()
    print(file_path)
    if not file_path.is_relative_to(TEST_FILES_DIR):
        raise HTTPException(status_code=400, detail="Invalid file name")

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="File contains invalid JSON")

@router.get("/headlines")
async def get_headlines():
    results = download_articles()
    for c in results:
        print(c[len(c)-1])
    return results