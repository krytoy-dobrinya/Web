from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DB_FILENAME = os.environ.get("SUMMARIZER_DB", "summarizer.db")
DATABASE_URL = f"sqlite:///{DB_FILENAME}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    summary = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default = datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)