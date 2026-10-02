import requests

time_req = requests.get("https://timeapi.io/api/v1/time/current/utc")
current_time = time_req.json()
print(current_time)

def get_current_time():
    return current_time
