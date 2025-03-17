import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Initialize the Selenium WebDriver
options = webdriver.ChromeOptions()
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)
options.binary_location = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"  # Update this path if necessary
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Open the Exam Page
exam_url = "http://localhost:3000/exam"  # Update if needed
driver.get(exam_url)
time.sleep(3)  # Wait for the page to load

def simulate_human_typing(element, text):
    """Simulates human-like typing with random delays."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.05, 0.2))  # Random delay between keystrokes

def navigate_questions():
    """Navigates through exam questions, attempts to fill answers, and submits the exam."""
    question_count = len(driver.find_elements(By.XPATH, "//span[contains(text(), 'Question')]"))  # Count total questions
    
    for i in range(question_count):
        try:
            # Locate the coding editor and type an answer
            editor = driver.find_element(By.CLASS_NAME, "monaco-editor")
            editor.click()
            code_answer = "print('Hello, World!')"  # Placeholder answer, to be optimized by RL
            simulate_human_typing(editor, code_answer)

            time.sleep(random.uniform(1, 3))  # Mimic thinking delay

            # Click "Next" or "Submit"
            if i < question_count - 1:
                next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
                next_button.click()
            else:
                submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Submit Exam')]")
                submit_button.click()
                print("[✅] Exam Submitted!")
        except Exception as e:
            print(f"[❌] Error on question {i+1}: {e}")

        time.sleep(random.uniform(2, 5))  # Randomized delay before next action

# Start bot operations
navigate_questions()
driver.quit()
