import os,time
import json
from dotenv import load_dotenv
from kafka import KafkaProducer
from football_api import FootballAPI

load_dotenv()


class KafkaDataPush:
    def __init__(self):
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.producer = KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: str(k).encode("utf-8"),
        )

    def send(self, topic, key, message):
        self.producer.send(topic, key=key, value=message)

    def flush(self):
        self.producer.flush()


if __name__ == "__main__":
    api = FootballAPI()
    pusher = KafkaDataPush()
    League=["PL", "PD", "SA", "BL1", "FL1"]
    for competition in League:
        matches = api.get_matches(competition, status="FINISHED")
        if matches:
            for match in matches["matches"]:
                pusher.send("raw.matches", match["id"], match)
        else:
            print(f"[SKIP] Matches for {competition}")
        standings = api.get_standings(competition)
        if standings:
            pusher.send("raw.standings", competition, standings)
        else:
            print(f"[SKIP] Standings for {competition}")
    # ... same for scorers, teams
        scorers = api.get_scorers(competition)
        if scorers:
            pusher.send("raw.scorers",competition,scorers)
        else:
            print(f"[SKIP] Scorers for {competition}")
        teams = api.get_teams(competition)
        if teams:
            pusher.send("raw.teams",competition,teams)
        else:
            print(f"[SKIP] Teams for {competition}")
        time.sleep(25)

    pusher.flush()