import csv
import random
from datetime import datetime, timedelta

def get_crowd_count(location_name, hour, day_of_week):
    base = random.randint(10, 30)
    
    # weekday vs weekend
    is_weekend = day_of_week >= 5
    
    if "Canteen" in location_name:
        if is_weekend:
            base = random.randint(20, 50)
        elif 12 <= hour <= 14:
            base = random.randint(70, 95)
        elif 19 <= hour <= 21:
            base = random.randint(60, 85)
        else:
            base = random.randint(10, 30)

    elif "Library" in location_name:
        if is_weekend:
            base = random.randint(10, 30)
        elif 9 <= hour <= 17:
            base = random.randint(40, 70)
        else:
            base = random.randint(5, 20)

    elif "Lab" in location_name or "Workshop" in location_name:
        if is_weekend:
            base = random.randint(5, 15)
        elif 9 <= hour <= 17:
            base = random.randint(50, 80)
        else:
            base = random.randint(5, 15)

    elif "Bus Stop" in location_name:
        if 8 <= hour <= 10 or 17 <= hour <= 19:
            base = random.randint(60, 90)
        else:
            base = random.randint(5, 20)

    elif "Hostel" in location_name:
        if 20 <= hour <= 23 or 0 <= hour <= 7:
            base = random.randint(50, 80)
        else:
            base = random.randint(10, 30)

    return min(base, 100)

LOCATIONS = [
    "Main Canteen", "AB Block", "Library", "Gate 1 (Main Gate)",
    "Gate 2", "Workshop", "EC Block", "Bus Stop Gate 1",
    "Bus Stop Gate 2", "Boys Hostel Block A", "Girls Hostel",
    "Sports Ground", "Admin Block", "Computer Lab", "Medical Centre"
]

# 30 din ka data generate karo
rows = []
start_date = datetime(2024, 1, 1)

for day in range(30):
    current_date = start_date + timedelta(days=day)
    day_of_week = current_date.weekday()
    
    for hour in range(24):
        for location in LOCATIONS:
            count = get_crowd_count(location, hour, day_of_week)
            rows.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'hour': hour,
                'day_of_week': day_of_week,
                'location': location,
                'count': count
            })

# CSV mein save karo
with open('crowd_data.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['date', 'hour', 'day_of_week', 'location', 'count'])
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ {len(rows)} rows generated!")
print("crowd_data.csv saved!")