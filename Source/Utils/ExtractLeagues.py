import json
import pandas as pd

class ExtractLeagues:
    def __init__(self):
        self.path = r"/home/akarsh/Documents/Data Engineering/Football_Analytics/Source/Data/Competitions_Data.json"
    

    def read_json(self):
        # with open(self.path, "r") as f:
        #     data = json.load(f)
        # json_df = pd.json_normalize(data["competitions"])
        # print(json_df.columns)
        with open(self.path,"r") as file:
            data = json.load(file)
        json_df=pd.json_normalize(data["competitions"])
        new_df= json_df[['name','code','type']]
        new_df.to_csv(r"/home/akarsh/Documents/Data Engineering/Football_Analytics/Source/Data/leagues_csv",index=False)
        # json_df.to_csv("/home/akarsh/Documents/Data Engineering/Football_Analytics/Source/Data/leagues_csv",index=False)
        print(json_df[["name","code","type"]])
        

if __name__ == "__main__":
    extract = ExtractLeagues()
    extract.read_json()
