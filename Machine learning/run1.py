from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langchain_core.runnables import RunnablePassthrough

# Load LLM Model
llm = OllamaLLM(model="llama3", temperature=0.3)  # Lower temperature for more focused responses

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

def generate_hints(problem, difficulty, current_progress):
    """Generates three levels of hints based on user progress."""
    chain = prompt_template | llm
    response = chain.invoke({
        "problem": problem,
        "difficulty": difficulty,
        "current_progress": current_progress
    })
    return response

# Example Usage
if __name__ == "__main__":
    sample_problem = "Given a dataset of customer transactions, predict whether a customer will churn. The dataset contains features like 'Purchase Frequency', 'Last Purchase Date', and 'Customer Tenure'."
    difficulty = "Medium"
    current_progress = "Candidate has identified key features but is unsure how to select the most important ones for the model."
    hints = generate_hints(sample_problem, difficulty, current_progress)
    print("\nGenerated Hints:\n")
    print(hints)