import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from flask import Flask, request, jsonify, render_template
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load OpenAI Model
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Hybrid Prompt Template
prompt_template = ChatPromptTemplate.from_messages([
    ("human", """
You are a non-interactive personalized assistant designed to help candidates in a proctoring test environment.
The candidate is currently attempting the following problem:
Problem: {problem}
Difficulty Level: {difficulty}
Candidate's Current Progress: {current_progress}

Provide three distinct and escalating levels of hints based on the candidate's progress. Focus on encouraging critical thinking and problem-solving while tying the hints to a real-world context:
1. **Gentle Nudge**: Ask a thought-provoking question or suggest a general direction, using a real-world analogy if possible (e.g., "What patterns do you notice in the data that might relate to customer churn? Think about how a business might identify customers at risk of leaving based on their behavior").
2. **Stronger Hint**: Recommend a specific approach or technique to explore, framed in a real-world context (e.g., "Consider using a feature importance ranking method like Recursive Feature Elimination (RFE) to identify key predictors of churn, similar to how a business might prioritize customer retention strategies").
3. **Direct Guidance**: Provide a high-level framework for applying the technique, without giving away the full solution (e.g., "Start by ranking features based on their importance scores, then select the top N features that are most predictive of churn. Think about how a business might use these insights to target at-risk customers").

Ensure that:
- Each hint level is distinct and does not overlap with the others.
- No full answers or direct implementation details are provided.
- The hints are encouraging, relatable, and maintain the integrity of the learning process.
""")
])

def generate_hints_internal(problem, difficulty, current_progress):
    """Internal function that generates three levels of hints based on user progress."""
    chain = prompt_template | llm
    response = chain.invoke({
        "problem": problem,
        "difficulty": difficulty,
        "current_progress": current_progress
    })
    return response

@app.route('/')
def home():
    """Root route to provide a simple interface for testing."""
    return """
    <html>
        <head>
            <title>Hint Generator</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #4a5568; }
                label { display: block; margin-top: 10px; font-weight: bold; }
                textarea, input { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; }
                button { margin-top: 15px; padding: 10px 15px; background-color: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background-color: #3182ce; }
                #results { margin-top: 20px; white-space: pre-wrap; background-color: #f7fafc; padding: 15px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>AI Hint Generator</h1>
            <p>Enter the problem information below to generate hints:</p>
            <div>
                <label for="problem">Problem:</label>
                <textarea id="problem" rows="4" placeholder="Describe the problem"></textarea>
            </div>
            <div>
                <label for="difficulty">Difficulty Level:</label>
                <input type="text" id="difficulty" placeholder="Easy, Medium, Hard, etc.">
            </div>
            <div>
                <label for="progress">Current Progress:</label>
                <textarea id="progress" rows="4" placeholder="Describe what the student has done so far"></textarea>
            </div>
            <button onclick="generateHints()">Generate Hints</button>
            <div id="results"></div>

            <script>
                function generateHints() {
                    const problem = document.getElementById('problem').value;
                    const difficulty = document.getElementById('difficulty').value;
                    const progress = document.getElementById('progress').value;
                    
                    if (!problem || !difficulty || !progress) {
                        alert('Please fill out all fields');
                        return;
                    }
                    
                    document.getElementById('results').innerText = 'Generating hints...';
                    
                    fetch('/generate_hints', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            problem: problem,
                            difficulty: difficulty,
                            current_progress: progress
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('results').innerText = data.hints;
                    })
                    .catch(error => {
                        document.getElementById('results').innerText = 'Error: ' + error;
                    });
                }
            </script>
        </body>
    </html>
    """

@app.route('/generate_hints', methods=['POST'])
def generate_hints_api():
    """API endpoint to generate hints."""
    try:
        data = request.json
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({"error": "Invalid request. Please provide JSON data."}), 400
        
        problem = data.get('problem', '')
        difficulty = data.get('difficulty', '')
        current_progress = data.get('current_progress', '')
        
        print(f"Problem: {problem}, Difficulty: {difficulty}, Progress: {current_progress}")
        
        if not problem or not difficulty or not current_progress:
            return jsonify({"error": "Missing required fields: problem, difficulty, or current_progress"}), 400
        
        try:
            print("Calling OpenAI API...")
            hints = generate_hints_internal(problem, difficulty, current_progress)
            print(f"Received hints: {hints}")
            return jsonify({"hints": hints})
        except Exception as e:
            import traceback
            print(f"Error generating hints: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"error": f"Error generating hints: {str(e)}"}), 500
    except Exception as e:
        import traceback
        print(f"Unexpected error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)