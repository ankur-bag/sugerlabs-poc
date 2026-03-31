# 🚀 Sugar Reflect Buddy (GSoC '26)

**Sugar Reflect Buddy** is a production-grade, AI-powered journaling assistant designed for young learners (ages 6–15) within the Sugar Labs ecosystem. It transforms traditional, static "forms" into a dynamic, friendly conversational experience that guides students through the **Kolb Learning Cycle** to turn daily activities into meaningful reflections.

---

## 🏗️ Elite GSoC Architecture

The project is architected with a strict **Separation of Concerns**, ensuring modularity, security, and scalability:

- **`/Frontend`**: A high-performance **Next.js 15** application (Pages Router) focused entirely on UI/UX, animations, and state management.
- **`/Backend`**: A robust **FastAPI (Python)** server handling all AI orchestration, business logic, and database persistence.

### 🔐 Security & Infrastructure
- **Clerk Authentication**: Full user lifecycle management with secure, auth-gated access to private journals.
- **Isolated Environments**: AI keys and MongoDB credentials are restricted to the server-side, never exposed to the client.
- **Asynchronous Data Layer**: Utilizes **Motor (Async MongoDB)** for non-blocking database operations.

---

## 🧠 Core Features

### 🌟 Intelligent Reflection Engine
Powered by **Gemini 2.5 Flash**, the reflection engine isn't a basic chatbot—it's a structured pedagogical tool:
- **Kolb's Cycle Integration**: Automatically guides users through 4 stages: *Experience* (What happened?) → *Reflection* (How did it feel?) → *Conceptualization* (What was learned?) → *Experimentation* (What's next?).
- **Stage-Aware Prompting**: The AI dynamically adjusts its questioning based on the current conversational state stored in the DB.
- **Failsafe Conclusion**: Conversations are strictly capped at 4 user responses to prevent cognitive overload and ensure high completion rates.

### 🧸 Child-Friendly UX
- **Streamlined Onboarding**: A 5-question, button-based profile setup designed to minimize "typing fatigue" for younger users.
- **Adaptive Tone**: The AI acknowledges age-group differences (6-8, 9-12, 13+) and adapts its complexity and emoji usage accordingly.
- **Recognition > Recall**: Frequently used options are provided as buttons to lower the barrier for expression.

### 📝 Expert Reflection Summaries
Upon cycle completion, a dedicated synthesis engine generates a **High-Quality Reflective Journal Entry**:
- **First-Person Perspective**: Entries are written as "I", creating a sense of ownership for the student.
- **Structured Synthesis**: Each entry covers *Action → Feeling → Challenges → Learning → Next Steps* in a single, well-written paragraph.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Framer Motion, Tailwind CSS, Clerk Auth.
- **Backend**: FastAPI, Pydantic v2, Motor (MongoDB), Google Generative AI.
- **Database**: MongoDB (3-Collection Design: `users`, `sessions`, `reflections`).

---

## 📂 Project Structure
```text
/Backend
 ├── app/
 │   ├── routes/      # Onboarding & Reflection (Kolb-logic) API endpoints
 │   ├── services/    # AI Orchestration & LLM personalization
 │   ├── models/      # Pydantic schemas for User/Session/Reflection
 │   └── main.py      # Server entry point
/Frontend
 ├── pages/
 │   ├── index.js     # Landing & Trigger simulation
 │   ├── onboarding.js# Button-based profile setup
 │   ├── reflect.js   # Real-time AI Chat UI
 │   └── journal.js   # Masonry-style reflection archive
```

---

## 🚀 How to Run

### 1. Backend (FastAPI)
```bash
cd Backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd Frontend
npm install
npm run dev
```

---

## 🎯 GSoC Impact
This POC is designed specifically for Sugar Labs creative platforms like **MusicBlocks** and **TurtleArt**. By integrating an `onSave()` trigger, the system provides a seamless bridge between *Doing* and *Learning*, meeting the highest standards for the GSoC '26 Reflection System requirements.
