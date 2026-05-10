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
def get_rl_score(target_phonemes, predicted_phonemes):
    target = target_phonemes.replace('|', '').replace(' ', '')
    prediction = predicted_phonemes.replace('|', '').replace(' ', '')
    
    n, m = len(target), len(prediction)
    dp = np.zeros((n + 1, m + 1))
    
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
        
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if target[i - 1] == prediction[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
            
    distance = dp[n][m]
    per = distance / len(target) if len(target) > 0 else 0
    rl_score = max(0.0, 1.0 - per)
    return rl_score

# 3. THE EAR (Powered by Librosa)
def evaluate_student_audio(audio_file_path, target_phonemes):
    # Librosa automatically loads the file, converts it to Mono, and resamples to 16000Hz!
    speech, _ = librosa.load(audio_file_path, sr=16000, mono=True)
        
    inputs = processor(speech, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(inputs.input_values).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    prediction = processor.batch_decode(predicted_ids)[0]
    
    score = get_rl_score(target_phonemes, prediction)
    
    print("-" * 30)
    print(f"🎯 Target: {target_phonemes}")
    print(f"🤖 Heard:  {prediction}")
    print(f"📊 RL Score: {score:.2f} / 1.00")
    print("-" * 30)
    
    return score