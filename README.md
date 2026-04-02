# Intelligent Reflection System for Sugar Journal (GSoC 2026 PoC)

> *"Rather than just being presented with an empty form, the learner will be prompted to talk about what they did, why they did it, what they learned and what they might do next."*  
> — Sugar Labs GSoC 2026 Project Description

A working Proof of Concept demonstrating AI-guided reflective practice inside the Sugar Journal, built as part of a GSoC 2026 application.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://gsoc-sugerlabs-poc.vercel.app/ |
| **Backend (Swagger)** | https://gsoc-sugerlabs-poc.onrender.com/docs |

> Backend is on Render free tier — may take ~30s to cold start on first request.

---

## GSoC Requirements → PoC Coverage

| GSoC Requirement | This PoC |
|---|---|
| Research different approaches to reflective practice | Implements **Kolb's Experiential Learning Cycle** (4-stage model) |
| LLM to generate prompts across multiple reflection approaches | **Gemini 2.0 Flash** dynamically generates stage-aware, child-friendly prompts |
| FastAPI endpoints to deploy the model | Full **FastAPI** backend with Swagger docs at `/docs` |
| Deploy in Sugar Journal triggered on save/pause | API contract defined; integration layer documented for Sugar Journal hooks |

---

## Problem Statement

The current Sugar Journal allows users to record activities but provides no structured guidance for reflection. This leads to:

- Shallow or incomplete reflections
- Low engagement from younger users
- Difficulty expressing learning outcomes

---

## Proposed Solution

An AI-powered reflection workflow that:

- Guides users step-by-step through Kolb's 4 reflection stages
- Generates structured, child-friendly prompts via Gemini 2.0 Flash
- Adapts follow-up prompts based on prior user responses
- Stores reflections as structured JSON in MongoDB Atlas

---

## System Architecture

![Sugar Reflect Buddy System Architecture](https://github.com/user-attachments/assets/f3ccb202-0679-41a2-bda3-91ecfb245f67)

---

## Core Components

### Reflection Engine
Controls the overall reflection workflow.
- Manages Kolb's 4-stage state machine
- Handles stage transitions and input validation

### Prompt Generator
Generates prompts based on reflection stage, previous responses, and activity context.

| Stage | Example Prompt |
|---|---|
| Concrete Experience | What did you do in this activity? |
| Reflective Observation | What was easy or difficult for you? |
| Abstract Conceptualization | What did you learn from this? |
| Active Experimentation | What will you try differently next time? |

### AI Layer (Gemini 2.0 Flash)
- Refines prompts to be age-appropriate
- Generates contextual follow-up questions
- Adapts tone based on user responses

### Response Structurer
Formats all responses into structured JSON for storage:
```json
{
  "experience": "I built a simple game",
  "reflection": "Fixing bugs was difficult",
  "conceptualization": "Debugging requires patience",
  "experimentation": "Next time I will test step by step"
}
```

---

## Data Flow
```
User completes a Sugar activity
        ↓
Journal entry is triggered
        ↓
Reflection session starts
        ↓
Stage-aware prompt is generated (Gemini 2.5 Flash)
        ↓
User responds
        ↓
AI adapts next prompt based on response
        ↓
Cycle repeats across all 4 Kolb stages
        ↓
Final structured reflection stored in MongoDB Atlas
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS, Vercel |
| Backend | Python, FastAPI |
| AI | Gemini 2.0 Flash |
| Database | MongoDB Atlas |

---

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

---

## Design Decisions

**Kolb's Learning Cycle** — provides a research-backed framework for structuring reflection into stages. Directly addresses the GSoC goal of exploring multiple approaches to reflective practice.

**Structured prompts over free-form input** — reduces cognitive load and helps younger users provide meaningful, complete responses rather than one-liners.

**Gemini 2.0 Flash** — chosen for speed and child-appropriate language generation. Designed to be swappable with an open-source LLM for offline Sugar deployments.

---

## Limitations

- No full integration with Sugar Journal (PoC only)
- Limited personalization across sessions
- Minimal UI — focus is on backend logic and AI layer

---

## Future Work

- Full integration with Sugar Activities and Journal hooks (triggered on save/pause)
- Persistent learner profiles across sessions
- Adaptive prompt generation based on history
- Multilingual support for global Sugar deployments
- Offline-compatible open-source LLM models
- Analytics dashboard for teachers and mentors

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## License

[MIT License](LICENSE)

---

## Acknowledgments

- Sugar Labs community and mentors
- Kolb's Experiential Learning Theory
- [Diwangshu's reflection widget for Music Blocks](https://github.com/sugarlabs/musicblocks) — prior art referenced in the GSoC project description
