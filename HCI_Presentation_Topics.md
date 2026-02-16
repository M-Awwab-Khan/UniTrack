# HCI Presentation Topics: UniTrack

This document outlines the 5 key topics for the Human Computer Interaction (SE-304) presentation, contextualized for the **UniTrack** project. Each section is designed to be presented by one student.

---

## 1. Understanding Problem & Users

**Objective:** Explain *why* we are building this and *who* it is for.

*   **The Problem: Platform Fragmentation**
    *   Currently, academic life is scattered across too many unlinked platforms:
        *   Assignments on **Google Classroom**.
        *   Deadlines collected via **Google Forms**.
        *   Urgent updates on **WhatsApp** groups.
        *   Timetable changes often communicated **verbally**.
    *   **Impact:** This leads to cognitive overload, missed deadlines, anxiety, and a disjointed learning experience. Students spend more time *finding* work than *doing* it.

*   **The Users (Stakeholders)**
    *   **Primary Users (Students):**
        *   *Needs:* One place to check "What do I need to do today?", reliable reminders, and clarity on their schedule.
        *   *Pain Points:* Fear of missing out (FOMO) on critical info, frustration with scattered links.
    *   **Secondary Users (Teachers & TAs):**
        *   *Needs:* Efficient way to broadcast info without repeating themselves, reduced repetitive queries (e.g., "Ma'am, when is the deadline?").

---

## 2. Interface Design Ideas & Flow

**Objective:** Describe the visual solution and how users move through it.

*   **Core Concept: The Centralized Dashboard**
    *   The interface isn't just a list of links; it's a **Command Center**.
    *   **Visual Strategy:** Usage of **Cards** and **Grid Layouts** to organize heterogeneous data (deadlines, schedules, announcements) into a cohesive view.

*   **User Flow (The "Happy Path")**
    1.  **Login:** Frictionless entry (email/password or magic link).
    2.  **Dashboard (Home):** The "At a Glance" view. Immediate visibility of:
        *   *Today's Classes* (Time & Location).
        *   *Upcoming Deadlines* (Urgency sorted).
        *   *Recent Announcements* (Critical updates).
    3.  **Course Drill-Down:** Clicking a course card takes the user to a specific context where they can access deep archives of notes and assignments.

*   **Design to Code:**
    *   We utilized **Figma** to prototype these flows, ensuring the logic held up before writing a single line of code.

---

## 3. Usability & Interaction Consideration

**Objective:** Discuss how we make the system easy, efficient, and pleasant to use.

*   **Usability Principles Applied:**
    *   **Visibility of System Status:** The user always knows where they are (breadcrumbs, active tab states).
    *   **Match between System and Real World:** using terminology like "Semester", "Course", "Deadline" rather than abstract database terms.
    *   **Error Prevention:** Confirmation modals before deleting items; clear error messages if a form submission fails.

*   **Interaction Design:**
    *   **Micro-interactions:** Subtle hover effects on cards and buttons make the interface feel "alive" and responsive.
    *   **Feedback:** Toast notifications (via `Sonner`) provide immediate feedback for actions (e.g., "Assignment Created Successfully").
    *   **Aesthetics:** A "Premium" feel using **Tailwind CSS v4** styling, dark mode support, and smooth animations (`Framer Motion`). This isn't just cosmetic; an attractive interface builds trust and engagement (Aesthetic-Usability Effect).

---

## 4. Tool Familiarity & Planning

**Objective:** Demonstrate technical competence and the modern workflow used.

*   **The "Agentic" Workflow:**
    *   We didn't just write code; we orchestrated a modern AI-assisted pipeline.
    *   **Figma:** Used for high-fidelity UI design.
    *   **Figma MCP Server + Antigravity:** We used Google DeepMind's agentic AI to **clone** Figma designs directly into React code. This bridges the gap between the "Designer's Vision" and the "Developer's Reality," ensuring pixel-perfect implementation.

*   **Tech Stack:**
    *   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
    *   **Backend:** tRPC v11 (for end-to-end type safety), Better Auth.
    *   **Database:** PostgreSQL with Drizzle ORM.

*   **Planning & Execution:**
    *   **Monorepo Structure:** Managed via Bun workspaces for scalability.
    *   **Phased Rollout:** Started with MVP (Core features) -> Planned future phases (Notifications, Admin Dashboard).

---

## 5. Linking Ideas to SDGs

**Objective:** Connect the project to the United Nations Sustainable Development Goals.

*   **SDG 4: Quality Education**
    *   **Goal:** Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.
    *   **UniTrack's Contribution:** By removing administrative friction and logistical barriers, UniTrack ensures that *every* student has equal access to course materials and deadlines. No student is left behind because they weren't in a specific WhatsApp group or missed a verbal announcement. It democratizes access to academic information.

*   **SDG 3: Good Health and Well-being**
    *   **Goal:** Ensure healthy lives and promote well-being for all at all ages.
    *   **UniTrack's Contribution:** Academic stress is a major contributor to student anxiety. By providing a reliable, single source of truth, `UniTrack` reduces the mental load and "deadline anxiety" that students face. Knowing exactly what is due and when promotes better mental well-being and allows students to manage their time effectively.
