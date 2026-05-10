# සිංහල Speech Trainer — Complete Setup Guide
# ================================================
# Follow EVERY step exactly. Don't skip any step.
# ================================================

## STEP 1 — Install Required Software
Open your computer and install:
- Node.js from https://nodejs.org (choose LTS version)
- Python from https://python.org (choose 3.10+)
- MySQL from https://dev.mysql.com/downloads/mysql/
- VS Code from https://code.visualstudio.com

---

## STEP 2 — Setup the Frontend

1. Open VS Code
2. Open a Terminal in VS Code (Menu → Terminal → New Terminal)
3. Type these commands one by one, press Enter after each:

```
cd Desktop
mkdir sinhala-speech
cd sinhala-speech
```

4. Copy the "sinhala-speech-frontend" folder into "sinhala-speech"

5. In the terminal, type:
```
cd sinhala-speech-frontend
npm install
```
Wait for it to finish (1-2 minutes)

6. To run the frontend:
```
npm run dev
```
Open http://localhost:3000 in your browser ✅

---

## STEP 3 — Setup MySQL Database

1. Open MySQL Workbench (installed with MySQL)
2. Connect to your local database
3. Click the SQL icon (lightning bolt)
4. Paste and run this SQL:

```sql
CREATE DATABASE IF NOT EXISTS sinhala_speech;
USE sinhala_speech;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  translation VARCHAR(200),
  phonetic VARCHAR(200),
  difficulty ENUM('easy','medium','hard') DEFAULT 'easy',
  category VARCHAR(100)
);

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT,
  exercise_title VARCHAR(200),
  score FLOAT NOT NULL,
  audio_path VARCHAR(500),
  rl_reward FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

INSERT INTO exercises (word, translation, phonetic, difficulty, category) VALUES
('ආයුබෝවන්', 'Hello / Welcome', 'aa-yu-boo-wan', 'easy', 'greetings'),
('ස්තූතියි', 'Thank you', 'sthoo-thi-yi', 'easy', 'greetings'),
('ගෙදර', 'Home', 'ge-da-ra', 'easy', 'places'),
('රෝහල', 'Hospital', 'roo-ha-la', 'easy', 'places'),
('පාසල', 'School', 'paa-sa-la', 'easy', 'places'),
('කෝප්ප', 'Cup', 'koop-pa', 'medium', 'objects'),
('ශ්‍රී ලංකාව', 'Sri Lanka', 'shree-lan-kaa-wa', 'medium', 'places'),
('ව්‍යාකරණ', 'Grammar', 'vyaa-ka-ra-na', 'hard', 'education'),
('සිංහල', 'Sinhala', 'sin-ha-la', 'easy', 'language'),
('මහත්මයා', 'Gentleman / Mr.', 'ma-hat-ma-yaa', 'hard', 'titles');
```

---

## STEP 4 — Setup Backend (Python Flask)

1. In VS Code terminal, go back to "sinhala-speech" folder:
```
cd ..
mkdir backend
cd backend
```

2. Create a file called `requirements.txt` and paste:
```
flask
flask-cors
flask-jwt-extended
mysql-connector-python
bcrypt
numpy
librosa
soundfile
scipy
werkzeug
```

3. Install them:
```
pip install -r requirements.txt
```

4. Create a file called `app.py` — the complete backend code is in `backend/app.py`

5. Create a file called `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=sinhala_speech
JWT_SECRET=mysecretkey123changethis
```

6. Run the backend:
```
python app.py
```
You should see: Running on http://localhost:5000

---

## STEP 5 — Run Everything Together

Open TWO terminal windows:

Terminal 1 (Frontend):
```
cd Desktop/sinhala-speech/sinhala-speech-frontend
npm run dev
```

Terminal 2 (Backend):
```
cd Desktop/sinhala-speech/backend
python app.py
```

Now open: http://localhost:3000
- Click "Create Account" to register
- Log in and start practicing!

---

## TROUBLESHOOTING

Problem: "npm not found"
→ Restart VS Code after installing Node.js

Problem: "Module not found"  
→ Run `npm install` again in the frontend folder

Problem: MySQL connection error
→ Check your .env password matches MySQL Workbench password

Problem: Microphone not working
→ Allow microphone when browser asks
