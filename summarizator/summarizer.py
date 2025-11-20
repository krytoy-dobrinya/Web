import os
from pathlib import Path
import yt_dlp as ytdl
from moviepy import VideoFileClip
import ffmpeg
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


DONWLOAD_DIR = os.environ.get("DOWNLOAD_DIR", "downloads")

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
        # инфа содержит 'title' и 'ext'
        filename = ydl.prepare_filename(info)
    return Path(filename)


def extract_audio_to_wav(video_path: Path, out_wav: str = None, sr: int = 16000) -> Path:
    video_path = Path(video_path)
    if out_wav is None:
        out_wav = video_path.with_suffix('.wav')
    out_wav = Path(out_wav)

    clip = VideoFileClip(str(video_path))
    tmp_audio = video_path.with_suffix('.temp_audio.wav')
    clip.audio.write_audiofile(str(tmp_audio), fps=sr)
    clip.close()

    stream = ffmpeg.input(str(tmp_audio))
    stream = ffmpeg.output(stream, str(out_wav), ac=1, ar=sr)
    ffmpeg.run(stream, overwrite_output=True, quiet=True)

    try:
        os.remove(tmp_audio)
    except Exception:
        pass

    return out_wav


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

    # "summarize: " prefix
    input_text = "summarize: " + text
    inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)

    summary_ids = model.generate(inputs["input_ids"], max_length=150, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return summary
    
def summarize_pipeline(task_id: int, url: str):
    video_path = download_video(url)
    audio_path = extract_audio_to_wav(video_path)
    transcript = transcribe_audio_wisper(audio_path)
    summary = summarize_text(transcript)
    print(f'Summary {task_id} for {url}: {summary}')