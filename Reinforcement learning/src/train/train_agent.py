import gym
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
from exam_env import ExamEnv  # Importing the custom Gym environment

# Define Q-Network
class QNetwork(nn.Module):
    def __init__(self, state_size, action_size):
        super(QNetwork, self).__init__()
        self.fc1 = nn.Linear(state_size, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_size)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# Hyperparameters
STATE_SIZE = 10  # Example state size
ACTION_SIZE = 5  # Number of actions the bot can take
GAMMA = 0.99
EPSILON = 1.0
EPSILON_MIN = 0.1
EPSILON_DECAY = 0.995
LR = 0.001
MEMORY_SIZE = 10000
BATCH_SIZE = 32
TARGET_UPDATE = 10

# Initialize environment, model, optimizer
env = ExamEnv()
state_size = env.observation_space.shape[0]
action_size = env.action_space.n

policy_net = QNetwork(state_size, action_size)
target_net = QNetwork(state_size, action_size)
target_net.load_state_dict(policy_net.state_dict())
target_net.eval()

optimizer = optim.Adam(policy_net.parameters(), lr=LR)
memory = deque(maxlen=MEMORY_SIZE)

def select_action(state, epsilon):
    if random.random() < epsilon:
        return env.action_space.sample()
    else:
        with torch.no_grad():
            return torch.argmax(policy_net(torch.FloatTensor(state))).item()

def train_model():
    if len(memory) < BATCH_SIZE:
        return
    batch = random.sample(memory, BATCH_SIZE)
    states, actions, rewards, next_states, dones = zip(*batch)
    
    states = torch.FloatTensor(states)
    actions = torch.LongTensor(actions)
    rewards = torch.FloatTensor(rewards)
    next_states = torch.FloatTensor(next_states)
    dones = torch.FloatTensor(dones)
    
    q_values = policy_net(states).gather(1, actions.unsqueeze(1)).squeeze(1)
    next_q_values = target_net(next_states).max(1)[0]
    target_q_values = rewards + GAMMA * next_q_values * (1 - dones)
    
    loss = nn.MSELoss()(q_values, target_q_values.detach())
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# Training loop
num_episodes = 1000
epsilon = EPSILON
for episode in range(num_episodes):
    state = env.reset()
    total_reward = 0
    done = False
    
    while not done:
        action = select_action(state, epsilon)
        next_state, reward, done, _ = env.step(action)
        memory.append((state, action, reward, next_state, done))
        state = next_state
        total_reward += reward
        train_model()
    
    epsilon = max(EPSILON_MIN, epsilon * EPSILON_DECAY)
    if episode % TARGET_UPDATE == 0:
        target_net.load_state_dict(policy_net.state_dict())
    
    print(f"Episode {episode}, Total Reward: {total_reward}, Epsilon: {epsilon}")

# Save the trained model
torch.save(policy_net.state_dict(), "rl_agent.pth")
