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
        print(f"[MAIN] Creating item {item.id} for URL: {item.url}")
        
        # Создаем запись с временным summary
        new_item = Summary(id=item.id, url=item.url, summary="Processing...")
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        print(f"[MAIN] Item created in DB, starting pipeline...")
        
        # Запускаем pipeline и получаем результат
        summary_result = summarize_pipeline(item.id, item.url)
        
        # Обновляем запись с результатом
        new_item.summary = summary_result
        db.commit()
        
        print(f"[MAIN] Database updated with result: {summary_result[:100]}...")
        
        return {"id": new_item.id, "url": new_item.url, "summary": new_item.summary}
        
    except Exception as e:
        db.rollback()
        print(f"[MAIN] Error: {e}")
        import traceback
        traceback.print_exc()
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
def read_item(item_id: str):  # <-- Принимаем как строку, не как int
    db: Session = SessionLocal()
    try:
        # Пробуем конвертировать строку в целое число для поиска в БД
        try:
            item_id_int = int(item_id)
        except ValueError:
            # Если передали не число
            raise HTTPException(status_code=400, detail="Item ID must be a valid integer")

        print(f"[DEBUG] Searching for item with id (int): {item_id_int}")  # Для отладки

        item = db.query(Summary).filter(Summary.id == item_id_int).first()
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        return {"id": item.id, "url": item.url, "summary": item.summary}
    except HTTPException:
        # Пробрасываем HTTP-исключения (404, 400) как есть
        raise
    except Exception as e:
        # Логируем любую другую ошибку для диагностики
        print(f"[ERROR] Failed to fetch item {item_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while fetching item")
    finally:
        db.close()
