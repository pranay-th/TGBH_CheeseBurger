
## Workflow Diagram
![Image](https://github.com/user-attachments/assets/78532143-4e73-4cc3-9819-29aff2d3b0b9)

# Proctoring System: Cheating Analysis Workflow

## Overview
This document outlines the workflow for the AI-driven cheating analysis system in our proctoring application. The system monitors candidate behavior during exams, dynamically assesses risk levels, and triggers appropriate interventions to prevent cheating. The workflow leverages real-time data analysis, machine learning models, and external web scraping for comprehensive cheating detection.

---

## Workflow Breakdown

### 1. **Exam Initialization**
- **Step:** Candidate starts the exam.
- **Process:** The system begins monitoring the candidate's behavior, capturing various activity metrics.

### 2. **Behavior Monitoring**
- **Captured Data Includes:**
  - **Mouse Inactivity & Time**
  - **Keystroke Dynamics and Typing Speed**
  - **Clipboard and Copy-Paste Detection**
  - **Prolonged Inactivity**

- **Data Handling:**
  - Captured data is encrypted and transmitted via WebSockets for real-time analysis.

### 3. **Event Processing Layer**
- **Function:** Filters irrelevant user activities and passes significant actions for analysis.

### 4. **Dynamic Risk Scoring**
- **Process:**
  - Each user action is processed to compute a dynamic risk score.
  - Merges real-time WebSocket data with historical patterns for context.

- **Techniques Used:**
  - **Anomaly Detection** (Isolation Forest, Autoencoders, LSTMs)
  - **Reinforcement Learning (RL) Models** for adaptive risk scoring.

### 5. **Risk Level Analysis**
- **Risk Categories:**
  - **High Risk**: Immediate action required.
  - **Medium Risk**: AI chatbot prompts and further monitoring.
  - **Low Risk**: No immediate action.

### 6. **Intervention Strategies**
- **High Risk:** Immediate actions such as warnings or tab locks.
- **Medium Risk:**
  - AI chatbot prompts for user clarification.
  - If risk persists, further intervention actions are triggered.
- **Low Risk:** No direct intervention, but continuous monitoring persists.

### 7. **Cheat Detection Pipeline**
- **Web Scraping:** The system scrapes online cheating forums (e.g., Reddit, GitHub, Chegg) for related discussions or shared answers.
- **CheatDB Flagging:** Flags any matching activities or tools found in the database of known cheating methods.
- **Extension Monitoring:** Flags browser extensions that match known cheating software signatures.

### 8. **Logging and Reporting**
- All significant events and actions are logged securely.
- Post-exam reports summarize risk scores, flagged actions, and interventions taken.

---

## Suggestions for Improvement

### 1. **Weighted Risk Scoring**
- Assign different weights to each behavior metric to enhance scoring accuracy (e.g., clipboard activities may carry higher risk than typing speed).

### 2. **Behavioral Baseline Establishment**
- Implement a short initial period where the system establishes a baseline for normal behavior. This can reduce false positives.

### 3. **Explainable AI Integration**
- Ensure the AI models provide clear explanations for each flagged action to improve transparency and auditability.

### 4. **Real-Time Dashboard for Proctors**
- Develop a dashboard displaying live user risk levels and activities, enabling proctors to take timely manual actions.

### 5. **Advanced Clipboard Monitoring**
- Extend clipboard detection to compare pasted content against known resources or patterns from cheating forums.

### 6. **Post-Exam Risk Reporting**
- Enhance reporting by including detailed behavioral analytics and intervention summaries for post-exam reviews.

### 7. **Compliance and Privacy Enhancements**
- Ensure encrypted data storage and compliance with data privacy regulations (e.g., GDPR) to protect user information.

---

## Technologies & Tools Recommendation
- **WebSocket** for real-time data streaming.
- **Python** with libraries like Scikit-learn, TensorFlow, and PyTorch for ML models.
- **Node.js** for backend processing and WebSocket integration.
- **Scrapy** for efficient web scraping.
- **PostgreSQL** for secure data storage and CheatDB management.
- **Docker** for scalable deployment.

---

## Troubleshooting Guide
- **False Positives:** Verify baseline data and adjust model sensitivity.
- **Web Scraping Issues:** Ensure scraping is compliant with target site policies and handle potential bans.
- **High Latency:** Optimize WebSocket connections and processing layers for real-time efficiency.
- **Flagging Errors:** Regularly update CheatDB and validate extension signatures.

---
