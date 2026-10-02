import json
import os
 
from dotenv import load_dotenv

from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential

load_dotenv()
ACCOUNT_URL = f"https://{os.environ['AZURE_STORAGE_ACCOUNT_NAME']}.blob.core.windows.net"
 
CONTAINER_NAME = "articles"
BLOB_NAME = "latest-articles.json"

def download_articles() -> list:
    credential = DefaultAzureCredential()

    blob_service_client = BlobServiceClient(
            account_url=ACCOUNT_URL,
            credential=credential
        )
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)

    data = container_client.download_blob("latest-articles.json").readall()
    
    return json.loads(data)