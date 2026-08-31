---
title: CampusConnect Chatbot
emoji: 🤖
colorFrom: red
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# 🤖 IUT Assistant Chatbot

A RAG (Retrieval-Augmented Generation) chatbot powered by Flask, LangChain, and GROQ LLM.

## Quick Start

### Windows Users
Simply double-click `start_chatbot.bat` - it will handle everything automatically!

### Manual Setup

1. **Create virtual environment** (first time only):
   ```powershell
   python -m venv venv
   ```

2. **Activate virtual environment**:
   ```powershell
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in this directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Start the server**:
   ```powershell
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /ask
Ask a question to the chatbot.

**Request:**
```json
{
  "query": "What is ICT Fest?",
  "top_k": 3
}
```

**Response:**
```json
{
  "answer": "ICT Fest is...",
  "sources": [
    {
      "source_file": "ICT-Fest-2024-Sponsorship-Book.pdf",
      "page": 1,
      "similarity_score": 0.85,
      "content_preview": "..."
    }
  ],
  "context": "Full context used for answering..."
}
```

## Adding Documents

1. Place PDF files in the `data/pdf/` folder
2. Delete the `data/vector_store/` folder to force rebuild
3. Restart the Flask server

The vector store will be automatically rebuilt from all PDFs in the data folder.

## Tech Stack

- **Flask** - Web framework
- **LangChain** - LLM orchestration
- **GROQ** - LLM provider
- **ChromaDB** - Vector database
- **Sentence Transformers** - Embeddings

## Files

- `app.py` - Main Flask application
- `src/embedding.py` - Document chunking and embedding
- `src/vectorstore.py` - ChromaDB integration
- `src/dataloader.py` - PDF loading utilities
- `src/search.py` - Search functionality
- `requirements.txt` - Python dependencies

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your GROQ API key | Required |

## Troubleshooting

### ModuleNotFoundError
Make sure virtual environment is activated:
```powershell
venv\Scripts\activate
```

### Port already in use
Change the port in `app.py`:
```python
app.run(debug=True, port=5001)  # Use different port
```

### No documents in vector store
Check that PDFs are in `data/pdf/` folder and restart the server.

## Development

To modify the chatbot behavior, see:
- Prompt template: `app.py` line ~30
- Embedding model: `src/vectorstore.py`
- Chunk size: `src/embedding.py`
- LLM model: `app.py` line ~15

---

For full integration guide, see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
