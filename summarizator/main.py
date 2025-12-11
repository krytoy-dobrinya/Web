from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import init_db, Summary, SessionLocal
from pydantic import BaseModel
from summarizer import summarize_pipeline
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

class SummaryResponse(BaseModel):
    id: int
    url: str
    summary: str

@app.post("/create", response_model=SummaryResponse)
def create_item(item: SummaryResponse):
    db: Session = SessionLocal()
    try:
        new_item = Summary(id=item.id, url=item.url, summary = item.summary)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        summarize_pipeline(new_item.id, new_item.url)
        return {"id": new_item.id, "url": new_item.url, "summary": new_item.summary}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/get-all-items")
def get_all_items():
    db: Session = SessionLocal()
    try:
        items = db.query(Summary).all()
        return items
    finally:
        db.close()

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    db: Session = SessionLocal()
    try:
        item = db.query(Summary).filter(Summary.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"id": item.id, "url": item.url, "summary": item.summary}
    finally:
        db.close()
