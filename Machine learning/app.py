import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough

# Load environment variables
load_dotenv()

# Load OpenAI Model instead of Ollama
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Prompt Template for Comprehensive Hints
prompt_template = ChatPromptTemplate.from_messages([
    ("human", """
You are a non-interactive personalized assistant designed to help candidates in a proctoring test environment.
The candidate is currently attempting the following problem:
Problem: {problem}
Difficulty Level: {difficulty}
Candidate's Current Progress: {current_progress}

Provide three distinct and escalating levels of hints based on the candidate's progress:
1. **Gentle Nudge**: Offer a minimal conceptual cue or a general direction to think about. Do not provide specific methods or steps.
2. **Stronger Hint**: Suggest a specific technique or approach to consider, but do not explain how to implement it fully.
3. **Direct Guidance**: Provide a high-level step-by-step direction without giving away the full solution. Focus on guiding the candidate to think critically.

Ensure that:
- Each hint level is distinct and does not overlap with the others.
- No full answers or direct implementation details are provided.
- The hints are encouraging and maintain the integrity of the learning process.
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
    # Extract just the content as a string
    if hasattr(hints, 'content'):
        print("\nGenerated Hints:\n")
        print(hints.content)
    else:
        print("\nGenerated Hints:\n")
        print(hints)  # Fallback to printing the whole object