from flask import Flask, request, jsonify
from flask_cors import CORS
from src.search import RAGSearch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize RAG Search with improved accuracy
rag_search = RAGSearch(
    persist_dir="./data/vector_store",
    embedding_model="all-MiniLM-L6-v2",
    llm_model="llama-3.3-70b-versatile"  # Llama 3.3 70B via Groq API
)

print(f"[INFO] RAG Search initialized with {rag_search.vectorstore.collection.count()} documents.")

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'CampusConnect Chatbot API with Enhanced Accuracy',
        'features': [
            'Query preprocessing and expansion',
            'Cross-encoder re-ranking',
            'Confidence scoring',
            'Multi-document support',
            'Clean user interface without source exposure'
        ],
        'endpoints': {
            '/ask': 'POST - Send a query to the chatbot (returns answer with confidence)',
            'response_fields': {
                'answer': 'The chatbot response text',
                'confidence': 'Confidence level and score',
                'relevance_score': 'Overall relevance score (0-1)'
            }
        }
    })

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get('query', '')
    top_k = data.get('top_k', 5)  # Number of documents to use for context
    
    if not query:
        return jsonify({'error': 'Query cannot be empty'}), 400
    
    # Get enhanced response with confidence scoring
    result = rag_search.ask(query, top_k=top_k)
    
    # Return simplified response without exposing sources to users
    return jsonify({
        'answer': result['answer'],
        'confidence': result['confidence'],
        'relevance_score': result['relevance_score']
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
