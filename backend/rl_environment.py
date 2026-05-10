import gymnasium as gym
from gymnasium import spaces
import numpy as np

class SinhalaTutorEnv(gym.Env):
    def __init__(self):
        super(SinhalaTutorEnv, self).__init__()
        
        # Action Space: 0 (Down), 1 (Stay), 2 (Up)
        self.action_space = spaces.Discrete(3)
        
        # Observation Space: [Level (1 to 7), Score (0.0 to 1.0)]
        self.observation_space = spaces.Box(
            low=np.array([1.0, 0.0]), 
            high=np.array([7.0, 1.0]), 
            dtype=np.float32
        )
        
        # Initial starting point for a new student
        self.current_level = 1
        self.last_score = 1.0 
        
    def step(self, action):
        # --- 1. CALCULATE THE REWARD (Grade the AI on the CURRENT state) ---
        reward = 0
        
        # Student mastered the current level (> 0.85)
        if self.last_score >= 0.85:
            if action == 2: reward = 1.0   # Good: Leveled up
            else: reward = -1.0            # Bad: Bored them or demoted unnecessarily
            
        # Student is learning (0.60 to 0.84)
        elif 0.60 <= self.last_score < 0.85:
            if action == 1: reward = 1.0   # Good: Let them practice
            else: reward = -1.0            # Bad: Moved too early or demoted unnecessarily
            
        # Student is struggling (< 0.60)
        else:
            if action == 0: reward = 1.0   # Good: Demoted to save confidence
            else: reward = -1.0            # Bad: Let them stay frustrated

        # --- 2. APPLY THE AI'S ACTION ---
        if action == 0:
            self.current_level = max(1, self.current_level - 1)
        elif action == 2:
            self.current_level = min(7, self.current_level + 1)
            
        # --- 3. SIMULATE THE NEXT ROUND ---
        # (Now we generate the new score for the next turn)
        difficulty_penalty = (self.current_level - 1) * 0.1
        simulated_score = np.random.normal(loc=0.9 - difficulty_penalty, scale=0.1)
        self.last_score = np.clip(simulated_score, 0.0, 1.0)
        
        # Check if the episode is done
        terminated = bool(self.current_level == 7 and self.last_score >= 0.85)
        
        state = np.array([self.current_level, self.last_score], dtype=np.float32)
        return state, reward, terminated, False, {}

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_level = 1
        self.last_score = 1.0
        return np.array([self.current_level, self.last_score], dtype=np.float32), {}