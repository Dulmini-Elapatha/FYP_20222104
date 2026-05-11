from fastapi import FastAPI, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import numpy as np
import random
from stable_baselines3 import DQN
from pydantic import BaseModel, EmailStr

# 1. Import your new Database modules
from database import init_db, SessionLocal, User, PracticeSession
from speech_scorer import evaluate_student_audio
from exercise_bank import sinhala_exercises

# 2. Initialize the Database tables on startup
init_db()

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


# ==========================================
# --- NEW AUTHENTICATION SECTION ---
# ==========================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr  # <-- This strictly rejects bad emails like "hansi@com"
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@app.post("/auth/register")
def register_user(user_data: UserRegister):
    db = SessionLocal()
    try:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create the new user
        new_user = User(
            email=user_data.email,
            password_hash=user_data.password, 
            current_level=1
        )
        db.add(new_user)
        db.commit()
        
        return {"status": "success", "message": "Account created successfully", "email": new_user.email}
    finally:
        db.close()

@app.post("/auth/login")
def login_user(login_data: UserLogin):
    db = SessionLocal()
    try:
        # Find the user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        
        # Check if user exists AND password matches
        if not user or user.password_hash != login_data.password:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        return {
            "status": "success", 
            "message": "Login successful", 
            "email": user.email, 
            "current_level": user.current_level
        }
    finally:
        db.close()

# ==========================================
# --- PRACTICE & PROGRESS SECTION ---
# ==========================================

@app.post("/process_turn")
async def process_turn(
    audio_file: UploadFile, 
    current_level: int = Form(...),
    target_phonemes: str = Form(...),
    user_email: str = Form(...),     
    attempted_word: str = Form(...)  
):
    """
    The main loop: Receives audio, grades it, asks the RL agent for the next level, 
    saves the session to the database, and returns the next exercise.
    """
    if not audio_file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav files are supported")

    temp_file_path = f"temp_{audio_file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    # Open a Database Session
    db = SessionLocal()
    
    try:
        # 1. GRADE THE AUDIO
        score, heard_text = evaluate_student_audio(temp_file_path, target_phonemes)
        
        # 2. ASK THE RL AGENT WHAT TO DO NEXT
        current_state = np.array([current_level, score], dtype=np.float32)
        action, _ = rl_agent.predict(current_state, deterministic=True)
        
        # 3. CALCULATE THE NEW LEVEL
        new_level = current_level
        if action == 0:  # Decrease
            new_level = max(1, current_level - 1)
        elif action == 2:  # Increase
            new_level = min(7, current_level + 1)
            
        # 4. SAVE TO DATABASE
        # Ensure the user exists in the DB first (NO MORE LAZY CREATION)
        user = db.query(User).filter(User.email == user_email).first()
        if user:
            user.current_level = new_level
        else:
            raise HTTPException(status_code=401, detail="User not found. Please log in.")

        # Calculate text difficulty for the dashboard
        difficulty = "easy" if current_level <= 2 else "medium" if current_level <= 4 else "hard"
        
        # Log the practice session
        new_session = PracticeSession(
            user_email=user_email,
            word=attempted_word,
            score=float(score),
            difficulty=difficulty
        )
        db.add(new_session)
        db.commit() # Save all changes
            
        # 5. PICK THE NEXT WORD FROM THE EXERCISE BANK
        next_exercise = random.choice(sinhala_exercises[new_level])
        
        # Clean up the audio file
        os.remove(temp_file_path)
        
        # 6. SEND EVERYTHING BACK TO THE FRONTEND
        return {
            "status": "success",
            "previous_score": round(score, 2),
            "ai_action_taken": int(action),
            "new_level": new_level,
            "next_word_to_show": next_exercise["text"],
            "next_target_phonemes": next_exercise["target"],
            "heard_text": heard_text
        }
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Always close the database connection
        db.close()


@app.get("/speech/progress")
def get_progress(user_email: str):
    """
    Fetches the history from the database to populate the React Dashboard.
    """
    db = SessionLocal()
    try:
        # Fetch all sessions for this specific user, newest first
        sessions = db.query(PracticeSession).filter(PracticeSession.user_email == user_email).order_by(PracticeSession.created_at.desc()).all()
        
        history_data = []
        for s in sessions:
            history_data.append({
                "exercise_title": s.word,
                "score": s.score,
                "created_at": s.created_at.isoformat(),
                "difficulty": s.difficulty
            })
            
        # Compute the Best/Avg stats on the backend now
        total = len(history_data)
        avg = sum(s["score"] for s in history_data) / total if total > 0 else 0
        best = max((s["score"] for s in history_data), default=0)
        
        return {
            "progress": {
                "best_score": best,
                "avg_score": avg,
                "total_sessions": total
            },
            "history": history_data
        }
    finally:
        db.close()