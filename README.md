# Intelligent Reflection System for Sugar Journal (GSoC 2026 PoC)

## Overview

This project is a Proof of Concept (PoC) for an AI-guided reflection system designed for the Sugar Journal. The goal is to support learners in reflecting on their activities through structured, guided prompts instead of unstructured free-form input.

The system is based on Kolb’s Experiential Learning Cycle:
- Concrete Experience
- Reflective Observation
- Abstract Conceptualization
- Active Experimentation

It demonstrates how AI can be used to scaffold reflection and improve learning outcomes for young users.

---

## Problem Statement

The current Sugar Journal allows users to record activities but does not provide structured guidance for reflection. This leads to:
- Shallow or incomplete reflections
- Low engagement from younger users
- Difficulty in expressing learning outcomes

---

## Proposed Solution

This project introduces an AI-powered reflection workflow that:
- Guides users step-by-step through reflection stages
- Generates structured, child-friendly prompts
- Adapts prompts based on user input
- Stores reflections in a structured format

---

## System Architecture

Sugar Reflect Buddy System Architecture

Output Formatter<img width="1098" height="841" alt="image" src="https://github.com/user-attachments/assets/f3ccb202-0679-41a2-bda3-91ecfb245f67" />


## Core Components

### Reflection Engine
Controls the overall reflection workflow.
- Manages stages of reflection
- Handles state transitions
- Validates inputs

### Prompt Generator
Generates prompts based on:
- Reflection stage
- Previous responses
- Activity context

Example prompts:
- Experience: What did you do?
- Reflection: What was easy or difficult?
- Conceptualization: What did you learn?
- Experimentation: What will you try next time?

### Context Extractor
Processes:
- Activity metadata
- User inputs

Used to maintain context and improve prompt relevance.

### AI Layer
Provides:
- Prompt refinement
- Child-friendly language transformation
- Follow-up question generation

Can be implemented using:
- Rule-based templates
- LLM APIs

### Response Structurer

Formats responses into structured data.

Example:

```json
{
  "experience": "I built a simple game",
  "reflection": "Fixing bugs was difficult",
  "conceptualization": "Debugging requires patience",
  "experimentation": "Next time I will test step by step"

}
```



## Data Flow
User completes an activity → Journal entry is triggered → Reflection session starts → Prompts are generated sequentially → User responses are collected → AI adapts or refines prompts → Final structured reflection is stored

## Technology Stack
- **Language**: Python
- **Data Format**: JSON
- **AI Layer**: LLM API or rule-based system
- **Interface**: CLI or simple UI
- **Integration**: Sugar Journal (conceptual / experimental)

## Installation

```bash
git clone https://github.com/ankur-bag/gsoc-sugerlabs-poc.git
cd gsoc-sugerlabs-poc
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
python main.py
```

Follow the prompts to simulate a guided reflection session.

## Design Decisions

### Structured Prompts
Structured prompts reduce cognitive load and help users provide meaningful responses.

### Kolb's Learning Cycle
Provides a well-defined framework for organizing reflection into stages.

### AI Assistance
Allows dynamic adaptation of prompts and simplification of language for children.

## Limitations
- No full integration with Sugar Journal (PoC only)
- Limited personalization across sessions
- Basic AI adaptation
- Minimal user interface

## Future Work
- Full integration with Sugar Activities and Journal
- Persistent learner profiles
- Adaptive prompt generation based on history
- Multilingual support
- Offline-compatible AI models
- Analytics for teachers and mentors

## Contributing
1. Fork the repository
2. Create a new branch
3. Make changes
4. Submit a pull request

## License
[MIT License](LICENSE)

## Acknowledgments
- Sugar Labs community
- Kolb's Experiential Learning Theory
