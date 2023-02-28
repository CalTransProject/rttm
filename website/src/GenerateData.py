import random
import time
import json
# unix time stample
# number of vehicles in fram
# number of vehicles in each lane
# modified vehicle object that include vehicle id and identification confidence
# timestampe = time.time()
# framNumber = random.randint(0,2000)
# landNumber = random.randint(0,3)
# vehicleNumber = random.randint(0,5)
# vehicleConfidence = round(random.random(), 2)
# vehicleDic = {'id':vehicleNumber, 'confidence':vehicleConfidence}
veh_label = ["sedan", "suv", "truck", "bus", "pickup", "van"]
result = {
    "fid": random.randint(0, 2000),
    "timetampe": time.time(),
    "veh_in_lane": {
        "lane1": random.randint(0, 5),
        "lane2": random.randint(0, 5),
        "lane3": random.randint(0, 5),
        "lane4": random.randint(0, 5),
    },
    "pred": [
        {
            "vid": random.randint(0, 5),
            "position": [random.randint(0, 2000), random.randint(0, 2000)],
            "dimension":[random.randint(0, 20), random.randint(0, 20)],
            "label":veh_label[random.randint(0, 5)],
            "land":random.randint(0, 3),
            "confidence":round(random.random(), 2),
            "iconfidence":round(random.random(), 2)
        }
    ]
}
result["pred"].append({
    "vid": random.randint(0, 5),
    "position": [random.randint(0, 2000), random.randint(0, 2000)],
    "dimension": [random.randint(0, 20), random.randint(0, 20)],
    "label": veh_label[random.randint(0, 5)],
    "land": random.randint(0, 3),
    "confidence": round(random.random(), 2),
    "iconfidence": round(random.random(), 2)
})
result["pred"].append({
    "vid": random.randint(0, 5),
    "position": [random.randint(0, 2000), random.randint(0, 2000)],
    "dimension": [random.randint(0, 20), random.randint(0, 20)],
    "label": veh_label[random.randint(0, 5)],
    "land": random.randint(0, 3),
    "confidence": round(random.random(), 2),
    "iconfidence": round(random.random(), 2)
})
result["pred"].append({
    "vid": random.randint(0, 5),
    "position": [random.randint(0, 2000), random.randint(0, 2000)],
    "dimension": [random.randint(0, 20), random.randint(0, 20)],
    "label": veh_label[random.randint(0, 5)],
    "land": random.randint(0, 3),
    "confidence": round(random.random(), 2),
    "iconfidence": round(random.random(), 2)
})
# listVehicle = [{"timestamp": time.time(),
#         "frame_number": random.randint(0,2000),
#         "vehicles_in_each_lane": random.randint(0,3),
#         "vehicles": [{'id':random.randint(0,5), 'confidence':round(random.random(), 2)}]}]
# for x in range(0,100):
#     tempDict = [{"timestamp": time.time(),
#         "frame_number": random.randint(0,2000),
#         "vehicles_in_each_lane": random.randint(0,3),
#         "vehicles": [{'id':random.randint(0,5), 'confidence':round(random.random(), 2)}]}]
#     listVehicle.append(tempDict)
# for x in range(0,100):
#     result.update({"vehicle"+str(x):{
#                         "timestamp": time.time(),
#                         "frame_number": random.randint(0,2000),
#                         "vehicles_in_each_lane": random.randint(0,3),
#                         "vehicles": {'id':random.randint(0,5),
#                                     'confidence':round(random.random(), 2)
#                                     }
#                         }
#                     }
#                 )
for x in range(1, 10):
    result.update({"result"+str(x): {
        "fid": random.randint(0, 2000),
        "timetampe": time.time(),
        "veh_in_lane": {
            "lane1": random.randint(0, 5),
            "lane2": random.randint(0, 5),
            "lane3": random.randint(0, 5),
            "lane4": random.randint(0, 5),
        },
        "pred": [
            {
                "vid": random.randint(0, 5),
                "position": [random.randint(0, 2000), random.randint(0, 2000)],
                "dimension":[random.randint(0, 20), random.randint(0, 20)],
                "label":veh_label[random.randint(0, 5)],
                "land":random.randint(0, 3),
                "confidence":round(random.random(), 2),
                "iconfidence":round(random.random(), 2)
            }
        ]
    }})
    if x % 20 == 0:
        time.sleep(1)
with open("fake.json", "w") as f:
    json.dump(result, f, indent=4)
