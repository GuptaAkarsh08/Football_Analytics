import os
import json,time
import requests
from dotenv import load_dotenv

load_dotenv()


class FootballAPI:
    def __init__(self):
        self.api_key = os.getenv("FOOTBALL_API_KEY")
        self.base_url = os.getenv("FOOTBALL_BASE_URL", "https://api.football-data.org/v4")

        if not self.api_key:
            raise ValueError("FOOTBALL_API_KEY not found in .env")

    def fetch(self, competition, resource, params=None):
        """Generic fetcher for any competition resource."""
        url = f"{self.base_url}/competitions/{competition}/{resource}"
        print(url)
        headers = {"X-Auth-Token": self.api_key}

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()   # raises an error for 4xx/5xx
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] {resource} for {competition}: {e}")
            return None
    
    def simplify_match(self, match):
        return {
            "match_id": match["id"],
            "competition": match["competition"]["name"],
            "season": match["season"]["startDate"][:4],
            "matchday": match.get("matchday"),
            "utc_date": match["utcDate"],
            "status": match["status"],
            "home_team": match["homeTeam"]["name"],
            "away_team": match["awayTeam"]["name"],
            "home_score": match["score"]["fullTime"]["home"],
            "away_score": match["score"]["fullTime"]["away"],
            "winner": match["score"]["winner"],
        }

    # --- thin named wrappers for readability ---
    def get_matches(self, competition, status="FINISHED"):
        return self.fetch(competition, "matches", {"status": status})

    def get_standings(self, competition):
        return self.fetch(competition, "standings")

    def get_scorers(self, competition, limit=10):
        return self.fetch(competition, "scorers", {"limit": limit})

    def get_teams(self, competition):
        return self.fetch(competition, "teams")


if __name__ == "__main__":
    api = FootballAPI()
    Leagues = ["PL", "PD", "SA", "BL1", "FL1"]   # the big 5 European leagues
    for competition  in Leagues:
        matches = api.get_matches(competition, status="FINISHED")
        standings = api.get_standings(competition)
        scorers = api.get_scorers(competition)
        teams = api.get_teams(competition)
        time.sleep(7)  

