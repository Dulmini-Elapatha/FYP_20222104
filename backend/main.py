from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import numpy as np
import random
from stable_baselines3 import DQN

# Import your custom modules
from speech_scorer import evaluate_student_audio
from exercise_bank import sinhala_exercises

app = FastAPI(title="Sinhala Speech Tutor API")

# Setup CORS so your frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained AI Brain when the server starts
print("🧠 Loading RL Brain...")
rl_agent = DQN.load("tutor_brain")
print("✅ RL Brain Ready!")

@app.post("/process_turn")
async def process_turn(
    audio_file: UploadFile, 
    current_level: int = Form(...),
    target_phonemes: str = Form(...)
):
    """
    The main loop: Receives audio, grades it, asks the RL agent for the next level, 
    and returns the next exercise.
    """
    if not audio_file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav files are supported")

    temp_file_path = f"temp_{audio_file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    try:
        # 1. GRADE THE AUDIO
        score = evaluate_student_audio(temp_file_path, target_phonemes)
        
        # 2. ASK THE RL AGENT WHAT TO DO NEXT
        # Format the state exactly how the agent was trained: [Level, Score]
        current_state = np.array([current_level, score], dtype=np.float32)
        
        # Predict the action (deterministic=True means no random guessing)
        action, _ = rl_agent.predict(current_state, deterministic=True)
        
        # 3. CALCULATE THE NEW LEVEL
        new_level = current_level
        if action == 0:  # Decrease
            new_level = max(1, current_level - 1)
        elif action == 2:  # Increase
            new_level = min(7, current_level + 1)
            
        # 4. PICK THE NEXT WORD FROM THE EXERCISE BANK
        next_exercise = random.choice(sinhala_exercises[new_level])
        
        # Clean up the audio file
        os.remove(temp_file_path)
        
        # 5. SEND EVERYTHING BACK TO THE FRONTEND
        return {
            "status": "success",
            "previous_score": round(score, 2),
            "ai_action_taken": int(action),
            "new_level": new_level,
            "next_word_to_show": next_exercise["text"],
            "next_target_phonemes": next_exercise["target"]
        }
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))