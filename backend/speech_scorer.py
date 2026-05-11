import os
import torch
import numpy as np
import librosa  # <-- NEW: Bypassing torchaudio completely
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

# 1. LOAD THE MODEL
MODEL_PATH = "./model"
print("Loading Model...")
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH)
print("Model Ready!")

# 2. THE GRADER 
import re

def get_rl_score(target_phonemes, predicted_phonemes):
    # 1. Standardize strings (remove spaces, lower case)
    target = target_phonemes.replace(" ", "").lower()
    prediction = predicted_phonemes.replace(" ", "").lower()
    
    # 2. Collapse double letters (aa -> a) to handle vowel duration bias
    target = re.sub(r'(.)\1+', r'\1', target)
    prediction = re.sub(r'(.)\1+', r'\1', prediction)
    
    n, m = len(target), len(prediction)
    if n == 0: return 0.0
    
    # 3. Standard Levenshtein Math
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if target[i - 1] == prediction[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)

    distance = dp[n][m]
    
    # 4. The Final Score (Strict but fair)
    # We use (1 - distance/max_len) to get a true percentage.
    # NO ARTIFICIAL BOOSTS HERE.
    actual_score = max(0.0, 1.0 - (distance / max(n, m)))
    
    return actual_score

def evaluate_student_audio(audio_file_path, target_phonemes):
    speech, _ = librosa.load(audio_file_path, sr=16000, mono=True)
    speech = librosa.util.normalize(speech)
    speech, _ = librosa.effects.trim(speech, top_db=25)
        
    inputs = processor(speech, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(inputs.input_values).logits
    
    predicted_ids = torch.argmax(logits, dim=-1)
    prediction = processor.batch_decode(predicted_ids)[0]
    
    score = get_rl_score(target_phonemes, prediction)
    
    # CRITICAL: Return both score and prediction string
    return score, prediction