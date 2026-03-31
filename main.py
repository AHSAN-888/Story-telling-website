from flask import Flask, request, jsonify, send_from_directory, session
import google.generativeai as genai
import uuid

app = Flask(__name__, static_folder='.', template_folder='.')
app.secret_key = "super_secret_chatbot_session_key"

API_KEY = "AIzaSyBnuI1bgrdPncN40GNoKhzfOVb3jY-SwgE"
genai.configure(api_key=API_KEY)

system_instruction = """
You are a conversational AI chatbot.

You can:
* Chat normally
* Answer questions
* Generate stories if asked
* Continue conversation naturally

Always remember previous messages.
Be friendly and human-like.
"""

model = genai.GenerativeModel(
    model_name="gemini-flash-latest",
)

chat_sessions = {}

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

@app.route('/chat', methods=['POST'])
def chat():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    session_id = session['session_id']
    user_input = request.json.get("message")
    
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    if session_id not in chat_sessions:
        chat_sessions[session_id] = model.start_chat(history=[
            {"role": "user", "parts": [system_instruction]},
            {"role": "model", "parts": ["Understood. I'm ready to chat."]}
        ])

    try:
        chat_instance = chat_sessions[session_id]
        response = chat_instance.send_message(user_input)
        return jsonify({"response": str(response.text)})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
