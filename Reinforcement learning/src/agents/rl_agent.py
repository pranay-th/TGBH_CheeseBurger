import random
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque

# Hyperparameters
STATE_SIZE = 5  # Example: [time_left, question_difficulty, detected, attempts, success_rate]
ACTION_SIZE = 3  # Example: [1: Answer normally, 2: Search externally, 3: Use advanced cheating]
GAMMA = 0.95
EPSILON = 1.0
EPSILON_DECAY = 0.995
MIN_EPSILON = 0.01
LEARNING_RATE = 0.001
MEMORY_SIZE = 5000
BATCH_SIZE = 32

class QNetwork(nn.Module):
    """Neural network for Q-learning."""
    def __init__(self, input_dim, output_dim):
        super(QNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, output_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class RLAgent:
    """Reinforcement Learning Agent with Deep Q-Network."""
    def __init__(self):
        self.memory = deque(maxlen=MEMORY_SIZE)
        self.model = QNetwork(STATE_SIZE, ACTION_SIZE)
        self.optimizer = optim.Adam(self.model.parameters(), lr=LEARNING_RATE)
        self.criterion = nn.MSELoss()
        self.epsilon = EPSILON

    def select_action(self, state):
        """Selects an action using epsilon-greedy strategy."""
        if random.random() < self.epsilon:
            return random.randint(0, ACTION_SIZE - 1)  # Random action
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        with torch.no_grad():
            q_values = self.model(state_tensor)
        return torch.argmax(q_values).item()

    def train(self):
        """Trains the model using replay memory."""
        if len(self.memory) < BATCH_SIZE:
            return
        batch = random.sample(self.memory, BATCH_SIZE)
        states, actions, rewards, next_states = zip(*batch)

        states = torch.FloatTensor(states)
        actions = torch.LongTensor(actions)
        rewards = torch.FloatTensor(rewards)
        next_states = torch.FloatTensor(next_states)

        q_values = self.model(states)
        next_q_values = self.model(next_states).detach()
        target_q_values = rewards + GAMMA * torch.max(next_q_values, dim=1)[0]

        loss = self.criterion(q_values.gather(1, actions.unsqueeze(1)).squeeze(), target_q_values)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        if self.epsilon > MIN_EPSILON:
            self.epsilon *= EPSILON_DECAY  # Decay epsilon to reduce exploration over time

    def store_experience(self, state, action, reward, next_state):
        """Stores experience in replay memory."""
        self.memory.append((state, action, reward, next_state))
