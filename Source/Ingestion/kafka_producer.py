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

        standings = api.get_standings(competition)
    if standings:
        pusher.send("raw.standings", competition, standings)
    # ... same for scorers, teams
    time.sleep(7)

pusher.flush()