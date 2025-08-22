from fastapi import FastAPI, Query
from pydantic import BaseModel
import random

app = FastAPI()

@app.get("/generate_scenario")
def generate_scenario(
    mode: str = Query(..., regex="^(duel|chase|tracking)$"),
    difficulty: str = Query(..., regex="^(easy|medium|hard)$")
):
    scenario = {
        "mode": mode,
        "difficulty": difficulty,
        "positions": [
            {"x": random.randint(0, 100), "y": random.randint(0, 100)} for _ in range(2)
        ],
        "objectives": random.choice([
            "Capture the flag", "Defeat the opponent", "Evade detection"
        ]),
        "opponent_skill": random.choice(["novice", "intermediate", "expert"]),
        "environment": random.choice(["desert", "forest", "urban"])
    }
    return scenario
