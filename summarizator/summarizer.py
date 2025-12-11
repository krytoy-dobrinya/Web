import os
from pathlib import Path
import yt_dlp as ytdl
from moviepy import VideoFileClip
import torch
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


DOWNLOAD_DIR = os.environ.get("DOWNLOAD_DIR", "downloads")

def download_video(url: str, out_dir: str = "downloads") -> Path:
    out_dir_p = Path(out_dir)
    out_dir_p.mkdir(parents=True, exist_ok=True)
    ydl_opts = {
        'outtmpl': str(out_dir_p / '%(title)s.%(ext)s'),
        'format': 'bestvideo+bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    with ytdl.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
    return Path(filename)


def extract_audio_to_wav(video_path: Path, out_wav: str = None, sr: int = 16000) -> Path:
    video_path = Path(video_path)
    if out_wav is None:
        out_wav = video_path.with_suffix('.wav')
    out_wav = Path(out_wav)

    # MoviePy 2.x: VideoFileClip теперь принимает Path объект напрямую
    clip = VideoFileClip(video_path)
    tmp_audio = video_path.with_suffix('.temp_audio.wav')
    
    # MoviePy 2.x: write_audiofile не принимает logger параметр
    clip.audio.write_audiofile(tmp_audio, fps=sr)
    clip.close()
    
    return tmp_audio


def transcribe_audio_wisper(audio_path: Path, model_size: str = 'small', language: str  = 'ru', task: str = 'transcribe') -> str:
    model = WhisperModel(model_size, device='cpu', compute_type='float32')
    segments, info = model.transcribe(str(audio_path), beam_size=5, language=language, task=task)

    texts = []
    for segment in segments:
        texts.append(segment.text)
    full_text = ' '.join(texts)
    return full_text


def summarize_text(text):
    tokenizer = AutoTokenizer.from_pretrained("LaciaStudio/Lacia_sum_small_v1")
    model = AutoModelForSeq2SeqLM.from_pretrained("LaciaStudio/Lacia_sum_small_v1")

    input_text = "summarize: " + text
    inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)

    summary_ids = model.generate(inputs["input_ids"], max_length=150, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return summary


def summarize_pipeline(task_id: int, url: str):
    """Основная функция пайплайна - возвращает результат, НЕ обновляет БД здесь"""
    try:
        print(f"[SUMMARIZER] Starting pipeline for task {task_id}")
        
        # 1. Скачивание видео
        print(f"[SUMMARIZER] Downloading video from: {url}")
        video_path = download_video(url)
        print(f"[SUMMARIZER] Downloaded to: {video_path}")
        
        # 2. Извлечение аудио
        print(f"[SUMMARIZER] Extracting audio...")
        audio_path = extract_audio_to_wav(video_path)
        print(f"[SUMMARIZER] Audio saved to: {audio_path}")
        
        # 3. Транскрипция
        print(f"[SUMMARIZER] Transcribing audio...")
        transcript = transcribe_audio_wisper(audio_path)
        print(f"[SUMMARIZER] Transcription length: {len(transcript)} chars")
        
        # 4. Суммаризация
        print(f"[SUMMARIZER] Summarizing text...")
        summary = summarize_text(transcript)
        print(f"[SUMMARIZER] Summary generated, length: {len(summary)} chars")
        
        # 5. Очистка временных файлов (опционально)
        try:
            if video_path.exists():
                os.remove(video_path)
                print(f"[SUMMARIZER] Removed video file: {video_path}")
            if audio_path.exists():
                os.remove(audio_path)
                print(f"[SUMMARIZER] Removed audio file: {audio_path}")
        except Exception as cleanup_error:
            print(f"[SUMMARIZER] Cleanup warning: {cleanup_error}")
        
        return summary
        
    except Exception as e:
        print(f"[SUMMARIZER] ERROR in pipeline: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Ошибка обработки: {str(e)}"