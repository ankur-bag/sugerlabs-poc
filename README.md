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

> Backend is hosted on Render free tier — may take ~30s to cold start on first request.

---

![Landing Page](https://i.postimg.cc/fbQv5wBg/landing-poc.jpg)

---

## GSoC Requirements -> PoC Coverage

| GSoC Requirement | This PoC |
|---|---|
| Research different approaches to reflective practice | Implements **Kolb's Experiential Learning Cycle** (4-stage structured model) |
| LLM to generate prompts across multiple reflection approaches | **Gemini 2.5 Flash** generates stage-aware, child-friendly prompts dynamically |
| FastAPI endpoints to deploy the model | Full **FastAPI** backend with Swagger docs at `/docs` |
| Trigger reflection when a project is paused or saved | API contract defined; integration layer ready for Sugar Journal hooks |

---

## The Problem

The current Sugar Journal gives learners a blank text box.

This leads to shallow, one-line responses like *"it was fun"* — missing the deeper metacognitive reflection that Constructionist learning pedagogy depends on.

---

## The Solution

Structured, AI-guided reflection in 4 stages — based on Kolb's Experiential Learning Cycle:

```
Concrete Experience  ->  Reflective Observation  ->  Abstract Conceptualization  ->  Active Experimentation
  "What did you do?"     "What was hard or easy?"     "What did you learn?"          "What will you try next?"
```

Instead of a blank form, the learner is walked through each stage with AI-generated prompts that adapt to their responses in real time.

---

## System Architecture

![Sugar Reflect Buddy System Architecture](./assets/architecture.png)

The system is organized into 5 core components:

**Reflection Engine** — Controls the overall workflow, manages stage transitions, and validates inputs.

**Prompt Generator** — Generates context-aware prompts per stage using activity metadata and prior responses.

**Context Extractor** — Maintains session context across stages to keep prompts relevant.

**AI Layer (Gemini 2.5 Flash)** — Handles prompt refinement, child-friendly language transformation, and follow-up generation.

**Response Structurer** — Formats all responses into a structured JSON output ready for Sugar Journal storage.

---

## Data Flow

```
User completes activity
        |
Journal save/pause hook triggered
        |
Reflection session initialized
        |
Past session memory loaded from MongoDB (if exists)
        |
AI opens with callback to previous activity/insight
        |
Stage-by-stage prompts generated (Gemini 2.5 Flash)
        |
Emotion detected per response -> tone adapted in real time
        |
Final structured reflection + quality score stored in MongoDB
        |
save_to_memory written to user profile for next session
```

---

## Features

**Reflection Memory Across Sessions**

The system remembers what a learner worked on last time and opens the next session with a callback:

> *"Last time you built a game, you said debugging was really hard. Did you get a chance to try testing step by step like you planned?"*

`last_memory` is persisted in MongoDB at the end of every session and injected into the system prompt at the start of the next one — one MongoDB read at session start, no extra API calls.

**Emotion-Aware Prompting**

The AI detects sentiment in every learner response and adapts its tone accordingly:

| Detected Emotion | AI Behaviour |
|---|---|
| Frustrated / Negative | Validates first before probing deeper |
| Excited / Positive | Matches energy, encourages elaboration |
| Confused | Simplifies language, breaks the question into smaller parts |
| Neutral / Short | Warm but direct, gently probes for more |

**Reflection Quality Scorer**

At the end of every session the AI silently evaluates the depth of the learner's reflection and returns a structured score. The learner sees only the personalised feedback string — numeric scores are stored in MongoDB for teacher and mentor analytics.

**Context-Aware AI**

The AI understands what the learner is actually working on. If a learner mentions "Durga Puja" it recognises it as a cultural festival; if they build a game it asks about bugs specifically. Responses use the learner's actual name and avoid hollow affirmations — the tone is warm, grounded, and genuine.

**Rich First-Person Summaries**

The AI generates 3-5 sentence summaries written from the child's own perspective:

> *"Today I worked on building a simple game. I noticed that fixing bugs took a lot longer than I expected. I learned that testing each part separately makes it easier to find problems. Next time I want to plan my code before I start writing it."*

**Interactive Scorecard**

Every completed session generates a visual scorecard with star ratings across all 4 Kolb stages. Hovering over any metric slides open the AI's detailed, personalised reasoning for that score, animated with Framer Motion. Backed by regex-based JSON parsing with fallbacks so the scorecard never fails to load.

---

## Sample Output

```json
{
  "experience": "I built a simple game",
  "reflection": "Fixing bugs was difficult",
  "conceptualization": "Debugging requires patience",
  "experimentation": "Next time I will test step by step",
  "quality_score": {
    "experience_score": 4,
    "reflection_score": 3,
    "conceptualization_score": 5,
    "experimentation_score": 4,
    "overall_depth": 4,
    "feedback": "Great thinking about what you would do differently next time."
  },
  "save_to_memory": {
    "activity": "built a simple game",
    "insight": "debugging requires patience",
    "experimentation": "test step by step next time"
  }
}
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS, Framer Motion, Vercel |
| Backend | FastAPI, Python |
| AI | Gemini 2.5 Flash |
| Database | MongoDB Atlas |
| Deployment | Vercel (frontend), Render (backend) |

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

Follow the prompts to simulate a full guided reflection session across all 4 Kolb stages.

---

## Design Decisions

**Kolb's Cycle as the backbone** — Provides a research-backed, well-defined framework for staging prompts. Grounded in decades of educational theory, not arbitrary sequencing.

**Structured prompts over free-form** — Reduces cognitive load for young users. Children respond better to focused questions than open-ended blanks.

**Gemini 2.5 Flash for the AI layer** — Fast, low-latency, and capable of child-friendly language transformation without heavy prompt engineering.

**Session memory over stateless AI** — Stateless prompting treats every session as the first. Persisting `save_to_memory` in MongoDB means the AI can reference real history, which is the behaviour the Sugar Journal integration actually requires.

**FastAPI** — Lightweight, async, and ships with auto-generated Swagger docs — ideal for a PoC that needs to be evaluated quickly.

---

## Limitations (PoC Scope)

- No live integration with Sugar Journal (conceptual API contract only)
- Single reflection framework (Kolb only — Gibbs, Schon planned for full project)
- Quality scores not yet surfaced in a teacher-facing dashboard

---

## Future Work

- Full integration with Sugar Activities and Journal hooks (trigger on save/pause)
- Multi-framework support — Gibbs' Reflective Cycle, Schon's Reflection-in-Action
- Multilingual support for Sugar's global user base
- Offline-compatible lightweight models
- Teacher/mentor analytics dashboard using stored quality scores
- Voice input support — children type slowly

---

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## License

[MIT License](./LICENSE)

---

## Acknowledgments

- Sugar Labs community and mentors
- Kolb's Experiential Learning Theory (Kolb, 1984)
- Diwangshu's reflection widget for Music Blocks (GSoC 2025) — prior art that inspired this project
