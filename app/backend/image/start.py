# run_once.py
from database.run_pipeline import run_pipeline
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="run the news aggregation pipeline")
    parser.add_argument("-t", "--test", action="store_true", help="run the pipeline in test mode")
    parser.add_argument("-u", "--upload", action="store_true", help="upload results of pipeline")

    args = parser.parse_args()

    run_pipeline(args.test, args.upload)