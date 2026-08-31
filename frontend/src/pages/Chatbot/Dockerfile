FROM python:3.11-slim

WORKDIR /app

# Install the CPU-only build of torch first (much smaller than the default
# CUDA wheel) so sentence-transformers picks it up instead of pulling its own.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=7860
EXPOSE 7860

CMD ["python", "app.py"]
