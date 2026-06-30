import requests
import random
import time
from datetime import datetime

# server URL
SERVER_URL = "http://localhost:5000/api/crowd/update"

# DTU locations — seed data se same names
LOCATIONS = [
    "Main Canteen",
    "AB Block",
    "Library",
    "Gate 1 (Main Gate)",
    "Gate 2",
    "Workshop",
    "EC Block",
    "Bus Stop Gate 1",
    "Bus Stop Gate 2",
    "Boys Hostel Block A",
    "Girls Hostel",
    "Sports Ground",
    "Admin Block",
    "Computer Lab",
    "Medical Centre"
]

def get_crowd_count(location_name, hour):
    """
    Time of day ke hisaab se realistic crowd generate karo
    """
    # base crowd
    base = random.randint(10, 30)

    # canteen mein lunch/dinner time pe zyada bheed
    if "Canteen" in location_name:
        if 12 <= hour <= 14:  # lunch
            base = random.randint(70, 95)
        elif 19 <= hour <= 21:  # dinner
            base = random.randint(60, 85)
        else:
            base = random.randint(10, 30)

    # library mein exam time pe zyada
    elif "Library" in location_name:
        if 9 <= hour <= 17:
            base = random.randint(40, 70)
        else:
            base = random.randint(5, 20)

    # labs mein class hours pe zyada
    elif "Lab" in location_name or "Workshop" in location_name:
        if 9 <= hour <= 17:
            base = random.randint(50, 80)
        else:
            base = random.randint(5, 15)

    # bus stop pe morning/evening pe zyada
    elif "Bus Stop" in location_name:
        if 8 <= hour <= 10 or 17 <= hour <= 19:
            base = random.randint(60, 90)
        else:
            base = random.randint(5, 20)

    # hostel mein raat ko zyada
    elif "Hostel" in location_name:
        if 20 <= hour <= 23 or 0 <= hour <= 7:
            base = random.randint(50, 80)
        else:
            base = random.randint(10, 30)

    return min(base, 100)  # max 100

def simulate():
    print("🚀 Crowd simulator shuru ho gaya...")
    print("Har 10 second mein data bhejega\n")

    while True:
        hour = datetime.now().hour
        
        for location in LOCATIONS:
            count = get_crowd_count(location, hour)
            
            try:
                res = requests.post(SERVER_URL, json={
                    "locationName": location,
                    "count": count
                })
                
                if res.status_code == 200:
                    print(f"✅ {location}: {count}%")
                else:
                    print(f"❌ {location}: Error {res.status_code}")
                    
            except Exception as e:
                print(f"❌ Server se connect nahi ho pa raha: {e}")
                break

        print(f"\n--- {datetime.now().strftime('%H:%M:%S')} --- next update 10s mein\n")

        # Bus position bhi update karo
        bus_stops = [
            {"name": "Bus Stop Gate 1", "lat": 28.7478, "lng": 77.1158},
            {"name": "Bus Stop Gate 2", "lat": 28.7522, "lng": 77.1202}
        ]

        for stop in bus_stops:
            eta = random.randint(2, 15)  # 2-15 minutes mein bus aayegi
            try:
                requests.post("http://localhost:5000/api/crowd/bus-update", json={
                    "stopName": stop["name"],
                    "eta": eta
                })
            except:
                pass

        time.sleep(10)

if __name__ == "__main__":
    simulate()