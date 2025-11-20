from typing import Union
from fastapi import FastAPI, HTTPException
from db import init_db, Summary, SessionLocal
from pydantic import BaseModel
from summarizer import summarize_pipeline

app = FastAPI()

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
        db.refresh(new_item), 
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
    return {"item_id": item_id, "q": q}