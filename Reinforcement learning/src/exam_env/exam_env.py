import gymnasium as gym
from gymnasium import spaces
import numpy as np
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

class ExamEnv(gym.Env):
    metadata = {"render_modes": ["human"], "render_fps": 1}

    def __init__(self):
        super(ExamEnv, self).__init__()
        
        # Action space: Decide between typing code, submitting, or navigating
        self.action_space = spaces.Discrete(3)  # [0: type, 1: next, 2: submit]
        
        # Observation space: Page status, time left, etc.
        self.observation_space = spaces.Box(low=0, high=1, shape=(10,), dtype=np.float32)
        
        # Initialize WebDriver
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000/exam")
        time.sleep(3)
        
    def step(self, action):
        if action == 0:  # Type code
            editor = self.driver.find_element(By.CLASS_NAME, "monaco-editor")
            editor.send_keys("print('Hello World')")
        elif action == 1:  # Next question
            next_btn = self.driver.find_element(By.XPATH, "//button[contains(text(),'Next')]")
            next_btn.click()
        elif action == 2:  # Submit
            submit_btn = self.driver.find_element(By.XPATH, "//button[contains(text(),'Submit Exam')]")
            submit_btn.click()
            
        obs = np.random.rand(10)  # Placeholder observation
        reward = np.random.rand(1)[0]  # Placeholder reward
        done = False  # Change to True if exam ends
        return obs, reward, done, {}
    
    def reset(self):
        self.driver.get("http://localhost:3000/exam")
        return np.random.rand(10), {}
    
    def render(self):
        pass  # No need for rendering
    
    def close(self):
        self.driver.quit()
