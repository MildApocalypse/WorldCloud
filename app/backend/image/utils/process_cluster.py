from collections import defaultdict
from urllib.parse import urlparse

def process_clusters(clusters):
    processed_clusters = []
    
    for cluster in clusters:
        repeat_author = defaultdict(int)
        repeat_domain = defaultdict(int)
        cluster_weight = cluster[-1][0]
        cluster_phrase = cluster[-1][1]
        processed_cluster = []

        for entry in cluster[:-1]:
            if isinstance(entry, dict):

                domain = urlparse(entry.get("url")).netloc
                author = entry.get("author")
                if ((author not in repeat_author) and (domain not in repeat_domain)):
                    article = {"title": entry.get("title"),
                           "publishedAt": entry.get("publishedAt"),
                           "url": entry.get("url"),
                           "imageUrl": entry.get("urlToImage")}
                    processed_cluster.append(article)

                repeat_author[author] +=1
                repeat_domain[domain] +=1

        cluster_weight = len(processed_cluster)

        if cluster_weight > 1:
            info_array = [cluster_weight, cluster_phrase]
            processed_cluster.append(info_array)
            processed_clusters.append(processed_cluster) 

    return processed_clusters

def reduce_cluster(repeats: defaultdict, cluster_weight: int) -> int:
    for x in repeats.values():
        if x > 1:
            cluster_weight -= x - 1
    
    return cluster_weight
        


