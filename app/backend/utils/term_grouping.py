from collections import defaultdict

import nltk
nltk.download("stopwords")
nltk.download("punkt")

from rake_nltk import Rake

rake = Rake()

def rake_terms(clusters):
    terms = []
    for c in clusters:
        rake.extract_keywords_from_sentences(c)
        terms.append(rake.get_ranked_phrases_with_scores()[0])
    return terms

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(2, 3),
    max_features=20
)

def tfidf_terms(clusters):
    terms = []
    for c in clusters:
        matrix = vectorizer.fit_transform(c)
        
        features = vectorizer.get_feature_names_out()

        scores = np.array(matrix.sum(axis=0))[0]
        
        terms.append(sorted(zip(features, scores), key=lambda x: x[1])[0])
    return terms

from keybert import KeyBERT

kb = KeyBERT()

def keybert_terms(clusters):
    for c in clusters:
        headlines = [h["title"] for h in c if h.get("title")]
        headlines_string = " ".join(headlines)
        term = kb.extract_keywords(headlines_string, candidates=None, keyphrase_ngram_range=(1, 4), stop_words="english", top_n=1)
        c.append([len(c), term])
    return clusters

from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering

def agglomerate_clusters(articles):
    headlines = [h["title"] for h in articles if h.get("title")]

    st = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = st.encode(headlines, normalize_embeddings=True)

    ac = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=0.50,
        metric="cosine",
        linkage="average"
    )

    labels = ac.fit_predict(embeddings)

    label_clusters = defaultdict(list)
    for idx, label in enumerate(labels):
        label_clusters[label].append(articles[idx])

    clusters = sorted(label_clusters.values(), key=lambda c: len(c), reverse=True)

    return clusters[:30]


def group_terms(method, clusters):
    if(not clusters):
        return "no clusters"

    # if(method == "rake"):
    #     return rake_terms(clusters)
    
    # elif(method == "tfidf"):
    #     return tfidf_terms(clusters)
    
    elif(method == "keybert"):
        return keybert_terms(clusters)
    
    return "none"



