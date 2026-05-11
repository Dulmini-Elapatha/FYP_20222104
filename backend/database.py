from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# This creates the 'tutor.db' file in your folder automatically
SQLALCHEMY_DATABASE_URL = "sqlite:///./tutor.db"
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True) # For FYP, simple strings are okay
    current_level = Column(Integer, default=1)

class PracticeSession(Base):
    __tablename__ = "practice_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"))
    word = Column(String)
    score = Column(Float)
    difficulty = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Database connection setup 
# (check_same_thread=False is required for SQLite in FastAPI)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)