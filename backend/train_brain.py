import gymnasium as gym
from stable_baselines3 import DQN
from rl_environment import SinhalaTutorEnv

# 1. Initialize your custom environment
env = SinhalaTutorEnv()

# 2. Build and Train the AI Brain (Deep Q-Network)
print("🧠 Training the AI Brain... (Playing 20,000 simulated games)")
# MlpPolicy means a standard Neural Network. verbose=0 keeps the console clean.
model = DQN("MlpPolicy", env, verbose=0, learning_rate=0.001)

# Let it learn! This will take about 10 to 30 seconds on your laptop.
model.learn(total_timesteps=50000)

# 3. Save the trained brain
model.save("tutor_brain")
print("✅ Brain saved as 'tutor_brain.zip'!\n")

# ==========================================
# 4. THE EXAM: TESTING THE AI'S LOGIC
# ==========================================
print("--- 🧪 TESTING THE TRAINED AI ---")

# Reset the environment for a brand new student (Level 1, Score 1.0)
obs, info = env.reset()

for step in range(1, 16):
    # The AI looks at the observation (Level and Score) and predicts the best action
    # deterministic=True means "Don't guess, use the best logic you learned"
    action, _states = model.predict(obs, deterministic=True)
    
    # Translate the AI's math into human words
    if action == 0: 
        action_str = "⏬ Action 0 (Decrease Level)"
    elif action == 1: 
        action_str = "⏸️ Action 1 (Stay at Level)"
    elif action == 2: 
        action_str = "⏫ Action 2 (Increase Level)"
    
    # Print what the AI sees and does
    print(f"Step {step}:")
    print(f"  👀 AI Sees    --> Current Level: {obs[0]:.0f} | Student's Last Score: {obs[1]:.2f}")
    print(f"  🤖 AI Chooses --> {action_str}")
    
    # Actually take the action in the environment to get the next state and reward
    obs, reward, terminated, truncated, info = env.step(action)
    
    # Print the grading of the AI
    print(f"  🏆 AI Reward  --> {reward}")
    print("-" * 40)
    
    if terminated:
        print("🎓 SUCCESS! The student reached Level 7 and mastered it. Session Complete.")
        break