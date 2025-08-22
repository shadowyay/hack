from fastapi import FastAPI, Query
from pydantic import BaseModel
import random
import uvicorn
import time
import math
import json
import requests
import os
from typing import List, Dict, Any

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed, using system environment variables")

app = FastAPI(title="Wild West Duel AI Service", version="1.0.0")

class GameState(BaseModel):
    player_x: float
    player_y: float
    opponent_x: float
    opponent_y: float
    game_time: float
    countdown_phase: bool
    can_shoot: bool
    difficulty: str
    walls: List[Dict[str, float]] = []  # List of wall objects with x, y, width, height
    player_velocity_x: float = 0
    player_velocity_y: float = 0
    is_player_on_ground: bool = True

class AIDecision(BaseModel):
    should_shoot: bool
    should_jump: bool = False
    move_direction: str = "none"  # "left", "right", "none"
    reaction_time_ms: int
    movement_x: float = 0
    movement_y: float = 0
    accuracy_modifier: float = 1.0
    confidence: float = 0.5
    reasoning: str = ""

class LLMRequest(BaseModel):
    game_situation: str
    difficulty: str
    player_position: Dict[str, float]
    opponent_position: Dict[str, float]
    walls: List[Dict[str, float]]
    game_context: str

def call_llm_for_strategy(game_situation: str, difficulty: str, context: str) -> Dict[str, Any]:
    """
    Call Google Gemini API for strategic decision making - REAL IMPLEMENTATION
    """
    
    # Strategic prompt for Gemini
    prompt = f"""
You are an AI gunslinger in a Wild West duel. Make tactical decisions based on the situation.

Game Situation: {game_situation}
Difficulty: {difficulty}
Context: {context}

Analyze and respond in JSON format:
{{
    "should_shoot": true/false,
    "move_direction": "left"/"right"/"stay", 
    "should_jump": true/false,
    "aggression": 0.0-1.0,
    "reasoning": "tactical explanation"
}}

Consider: distance, positioning, cover, player movement patterns.
"""

    try:
        # Google Gemini API integration
        import requests
        import os
        
        # Get API key from environment
        gemini_api_key = os.getenv('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE')
        
        if gemini_api_key and gemini_api_key != 'YOUR_GEMINI_API_KEY_HERE':
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 150,
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                try:
                    # Extract text from Gemini response
                    gemini_text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Parse JSON from response
                    import json
                    import re
                    
                    # Extract JSON from response (sometimes wrapped in markdown)
                    json_match = re.search(r'\{.*\}', gemini_text, re.DOTALL)
                    if json_match:
                        gemini_decision = json.loads(json_match.group())
                        
                        return {
                            "aggression": gemini_decision.get("aggression", 0.6),
                            "tactical_thinking": gemini_decision.get("reasoning", "Gemini strategic analysis"),
                            "should_move": gemini_decision.get("move_direction", "stay"),
                            "jump_likelihood": 1.0 if gemini_decision.get("should_jump", False) else 0.2,
                            "reasoning": f"Gemini AI: {gemini_decision.get('reasoning', 'Strategic positioning')}"
                        }
                except Exception as e:
                    print(f"Gemini response parsing error: {e}")
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                
    except Exception as e:
        print(f"Gemini API not available: {e}")

    # Smart fallback with actual game analysis
    strategies = {
        "easy": {"aggression": 0.3, "jump_likelihood": 0.2},
        "medium": {"aggression": 0.6, "jump_likelihood": 0.4}, 
        "hard": {"aggression": 0.9, "jump_likelihood": 0.7}
    }
    
    strategy = strategies.get(difficulty.lower(), strategies["medium"])
    
    # Real tactical analysis
    if "player_close" in game_situation:
        return {
            "aggression": strategy["aggression"] * 1.2,
            "tactical_thinking": "Player close - tactical retreat and jump for advantage",
            "should_move": "back",
            "jump_likelihood": 0.6,
            "reasoning": "Close range detected - using evasive maneuvers"
        }
    elif "player_far" in game_situation:
        return {
            "aggression": strategy["aggression"],
            "tactical_thinking": "Player is far - move closer for better accuracy", 
            "should_move": "forward",
            "jump_likelihood": 0.2,
            "reasoning": "Long range - advancing for optimal shot"
        }
    elif "behind_cover" in context:
        return {
            "aggression": strategy["aggression"] * 0.8,
            "tactical_thinking": "Behind cover - wait for clear shot opportunity",
            "should_move": "none", 
            "jump_likelihood": 0.1,
            "reasoning": "Using cover advantage - patient approach"
        }
    else:
        return {
            "aggression": strategy["aggression"],
            "tactical_thinking": "Neutral position - maintain tactical advantage",
            "should_move": "tactical",
            "jump_likelihood": strategy["jump_likelihood"],
            "reasoning": "Standard tactical positioning"
        }

def analyze_tactical_situation(game_state: GameState) -> str:
    """Analyze the current game situation for LLM context"""
    
    distance = math.sqrt(
        (game_state.player_x - game_state.opponent_x) ** 2 + 
        (game_state.player_y - game_state.opponent_y) ** 2
    )
    
    situation_parts = []
    
    # Distance analysis
    if distance < 100:
        situation_parts.append("player_close")
    elif distance > 200:
        situation_parts.append("player_far")
    else:
        situation_parts.append("player_medium_range")
    
    # Height advantage analysis
    if game_state.opponent_y < game_state.player_y - 20:
        situation_parts.append("high_ground_advantage")
    elif game_state.opponent_y > game_state.player_y + 20:
        situation_parts.append("low_ground_disadvantage")
    
    # Wall coverage analysis
    for wall in game_state.walls:
        if (wall["x"] < game_state.opponent_x < wall["x"] + wall["width"] and
            wall["y"] < game_state.opponent_y < wall["y"] + wall["height"]):
            situation_parts.append("behind_cover")
            break
    
    # Player movement analysis
    if abs(game_state.player_velocity_x) > 1:
        situation_parts.append("player_moving")
    
    if not game_state.is_player_on_ground:
        situation_parts.append("player_airborne")
    
    return "_".join(situation_parts)

@app.get("/generate_scenario")
def generate_scenario(
    mode: str = Query(..., pattern="^(duel|chase|tracking)$"),
    difficulty: str = Query(..., pattern="^(easy|medium|hard)$")
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

@app.post("/ai_decision")
def get_ai_decision(game_state: GameState):
    """
    LLM-powered AI decision making for opponent behavior
    """
    difficulty = game_state.difficulty.lower()
    
    # Analyze current tactical situation
    situation = analyze_tactical_situation(game_state)
    
    # Get LLM strategic analysis
    context = f"Game time: {game_state.game_time}s, Can shoot: {game_state.can_shoot}"
    llm_strategy = call_llm_for_strategy(situation, difficulty, context)
    
    # Base parameters based on difficulty
    if difficulty == "easy":
        base_reaction_time = 800  # ms
        accuracy = 0.6
        movement_speed = 0.3
    elif difficulty == "medium":
        base_reaction_time = 500
        accuracy = 0.75
        movement_speed = 0.5
    else:  # hard
        base_reaction_time = 300
        accuracy = 0.9
        movement_speed = 0.8
    
    # Calculate distance to player for tactical decisions
    distance = math.sqrt(
        (game_state.player_x - game_state.opponent_x) ** 2 + 
        (game_state.player_y - game_state.opponent_y) ** 2
    )
    
    # LLM-influenced AI decision logic
    should_shoot = False
    should_jump = False
    move_direction = "none"
    reaction_time = base_reaction_time
    movement_x = 0
    movement_y = 0
    
    if game_state.can_shoot and not game_state.countdown_phase:
        # LLM-influenced shooting decision
        reaction_variance = random.uniform(0.8, 1.3)
        reaction_time = int(base_reaction_time * reaction_variance)
        
        # Use LLM strategy for shooting decision
        shoot_probability = llm_strategy["aggression"]
        
        # Adjust probability based on tactical analysis
        if "player_close" in situation:
            shoot_probability += 0.3
        elif "high_ground_advantage" in situation:
            shoot_probability += 0.2
        elif "behind_cover" in situation:
            shoot_probability -= 0.2
            
        should_shoot = random.random() < shoot_probability
    
    # LLM-influenced movement decisions
    if llm_strategy.get("should_move") == "forward":
        if game_state.opponent_x < game_state.player_x:
            move_direction = "right"
            movement_x = movement_speed
        else:
            move_direction = "left"
            movement_x = -movement_speed
    elif llm_strategy.get("should_move") == "back":
        if game_state.opponent_x < game_state.player_x:
            move_direction = "left" 
            movement_x = -movement_speed
        else:
            move_direction = "right"
            movement_x = movement_speed
    elif llm_strategy.get("should_move") == "tactical":
        # Tactical positioning based on walls and distance
        if distance > 150:
            move_direction = "forward"
            movement_x = movement_speed * 0.5
        elif distance < 80:
            move_direction = "back"
            movement_x = -movement_speed * 0.5
    
    # LLM-influenced jumping decision
    jump_probability = llm_strategy.get("jump_probability", 0.1)
    if random.random() < jump_probability:
        should_jump = True
        # Jump when player is moving or for tactical advantage
        if "player_moving" in situation or "low_ground_disadvantage" in situation:
            should_jump = True
    
    # Calculate accuracy modifier based on various factors
    accuracy_modifier = accuracy
    
    # Distance affects accuracy
    if distance > 150:
        accuracy_modifier *= 0.7
    elif distance < 50:
        accuracy_modifier *= 1.3
        
    # Height advantage affects accuracy
    if "high_ground_advantage" in situation:
        accuracy_modifier *= 1.2
    elif "low_ground_disadvantage" in situation:
        accuracy_modifier *= 0.8
        
    # Movement affects accuracy
    if move_direction != "none":
        accuracy_modifier *= 0.9
        
    # Cover affects accuracy
    if "behind_cover" in situation:
        accuracy_modifier *= 0.6
        
    accuracy_modifier = max(0.1, min(1.5, accuracy_modifier))
    
    # Calculate confidence based on tactical situation
    confidence = llm_strategy["aggression"] * 0.6 + accuracy_modifier * 0.4
    confidence = max(0.1, min(0.9, confidence))
    
    return AIDecision(
        should_shoot=should_shoot,
        should_jump=should_jump,
        move_direction=move_direction,
        reaction_time_ms=reaction_time,
        movement_x=movement_x,
        movement_y=movement_y,
        accuracy_modifier=accuracy_modifier,
        confidence=confidence,
        reasoning=llm_strategy.get("reasoning", "Tactical decision based on current situation")
    )

@app.post("/llm_strategy")
def get_llm_strategy(request: LLMRequest):
    """
    Direct LLM consultation for complex tactical decisions
    """
    try:
        # Call LLM for strategic analysis
        strategy = call_llm_for_strategy(
            request.game_situation,
            request.difficulty,
            request.game_context
        )
        
        return {
            "strategy": strategy,
            "tactical_advice": strategy.get("reasoning", ""),
            "confidence": strategy.get("aggression", 0.5),
            "recommended_actions": {
                "movement": strategy.get("should_move", "none"),
                "jump": strategy.get("jump_probability", 0) > 0.5,
                "aggression_level": strategy.get("aggression", 0.5)
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "fallback_strategy": {
                "movement": "defensive",
                "aggression_level": 0.3
            }
        }

@app.get("/ai_personality")
def get_ai_personality(difficulty: str = Query("medium", pattern="^(easy|medium|hard)$")):
    """
    Generate AI personality traits for consistent behavior
    """
    if difficulty.lower() == "easy":
        return {
            "name": "Slow Draw Pete",
            "aggression": 0.3,
            "accuracy": 0.6,
            "reaction_speed": 0.4,
            "tactical_thinking": 0.2,
            "unpredictability": 0.4,
            "jump_ability": 0.2,
            "description": "A novice gunslinger, still learning movement and tactics"
        }
    elif difficulty.lower() == "medium":
        return {
            "name": "Quick Shot Sam",
            "aggression": 0.6,
            "accuracy": 0.75,
            "reaction_speed": 0.7,
            "tactical_thinking": 0.6,
            "unpredictability": 0.5,
            "jump_ability": 0.6,
            "description": "An experienced fighter with balanced skills and good mobility"
        }
    else:  # hard
        return {
            "name": "Lightning Lou",
            "aggression": 0.9,
            "accuracy": 0.9,
            "reaction_speed": 0.95,
            "tactical_thinking": 0.8,
            "unpredictability": 0.3,
            "jump_ability": 0.9,
            "description": "A legendary gunslinger with superior movement and tactical awareness"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
