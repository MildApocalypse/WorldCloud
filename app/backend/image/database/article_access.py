import json
import os
 
from dotenv import load_dotenv

from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.identity import DefaultAzureCredential

load_dotenv()
ACCOUNT_URL = f"https://{os.environ['AZURE_STORAGE_ACCOUNT_NAME']}.blob.core.windows.net"
 
CONTAINER_NAME = "articles"
BLOB_NAME = "latest-articles.json"


def connection_test() -> bool:
    credential = DefaultAzureCredential()
    try:
        blob_service_client = BlobServiceClient(
            account_url=ACCOUNT_URL,
            credential=credential
        )
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        container_client.exists()
    except Exception as e:
        print (f"an exception occured: {e}")
        return False
    return True

    
def upload_articles(articles: list) -> None:
    credential = DefaultAzureCredential()

    blob_service_client = BlobServiceClient(
        account_url=ACCOUNT_URL,
        credential=credential
    )

    container_client = blob_service_client.get_container_client(CONTAINER_NAME)

    data = json.dumps(articles, indent=2)

    container_client.upload_blob(
        name=BLOB_NAME,
        data=data,
        overwrite=True,
        content_settings=ContentSettings(content_type="application/json"),
    )


