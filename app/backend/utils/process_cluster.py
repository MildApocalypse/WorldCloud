from collections import defaultdict


def process_clusters(clusters):
    processed_clusters = []
    for cluster in clusters:
        repeat_author = defaultdict(int)
        cluster_weight = cluster[-1][0]
        cluster_phrase = cluster[-1][1]
        processed_cluster = []

        for entry in cluster[:-1]:
            if isinstance(entry, dict):
                if not repeat_author.get(entry.get("author")):
                    article = {"title": entry.get("title"),
                           "publishedAt": entry.get("publishedAt"),
                           "url": entry.get("url"),
                           "imageUrl": entry.get("urlToImage")}
                    processed_cluster.append(article)
                repeat_author[entry.get("author")] += 1
        
        for x in repeat_author.values():
            if x > 1:
                cluster_weight -= x
        if cluster_weight > 1:
            info_array = [cluster_weight, cluster_phrase]
            processed_cluster.append(info_array)
            processed_clusters.append(processed_cluster) 

    return processed_clusters



