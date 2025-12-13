# **Product Requirements Document (PRD)**

## **Product Name (Working Title)**

**UniTrack**  
*(You can rename later — focus on functionality first)*

---

## **1\. Background & Problem Statement**

In the Software Engineering department (and across other departments), students frequently miss assignment deadlines, announcements, and schedule updates. The primary cause is **platform fragmentation**:

* Assignments shared on **Google Classroom**  
* Deadlines via **Google Forms**  
* Announcements on **WhatsApp**  
* Some instructions given **verbally in class**  
* Timetable changes communicated inconsistently

As a result:

* Students forget deadlines  
* Late submissions become common  
* Teachers receive repeated requests for deadline extensions  
* No centralized academic history exists (assignments done, classes attended, cancellations, etc.)

This problem is **systemic**, not individual.

---

## **2\. Product Vision**

Create a **single, centralized academic management platform** where students can access **everything related to a course** in one place — assignments, deadlines, announcements, schedules, notes, and class activity — eliminating reliance on scattered platforms.

---

## **3\. Goals & Objectives**

### **Primary Goals**

* Centralize all course-related academic information  
* Reduce missed deadlines and forgotten tasks  
* Improve student accountability and organization  
* Reduce administrative burden on teachers

### **Success Metrics (KPIs)**

* Reduction in late submissions  
* Daily active student usage  
* Percentage of assignments submitted before deadline  
* Teacher adoption rate per semester

---

## **4\. Target Users**

### **Primary Users**

* **Students** (undergraduate / graduate)

### **Secondary Users**

* **Teachers / Instructors**  
* **Teaching Assistants**  
* **Department Coordinators** (future scope)

---

## **5\. User Roles & Permissions**

### **Student**

* View enrolled courses  
* View assignments, deadlines, announcements  
* Receive reminders & notifications  
* Track submitted / pending tasks  
* View class timetable and history

### **Teacher**

* Create & manage courses  
* Add assignments, deadlines, projects  
* Post announcements & notes  
* Update class status (conducted, cancelled, compensatory)  
* View submission status (future scope)

### **Admin (Optional – Phase 2\)**

* Manage users & departments  
* Semester initialization  
* Course creation templates

---

## **6\. Core Features (MVP)**

### **6.1 Course Management**

* Course creation (by teacher/admin)  
* Course enrollment (via invite code)  
* Course overview dashboard

---

### **6.2 Assignment & Deadline Management**

* Create assignments with:  
  * Title  
  * Description  
  * Deadline  
  * Type (Lab, Quiz, Assignment, Project)  
* Assignment status:  
  * Upcoming  
  * Due Today  
  * Overdue  
* Student-side tracking:  
  * Not Started  
  * Submitted  
  * Missed

---

### **6.3 Announcements & Notices**

* Text-based announcements  
* Priority tagging (Important / Normal)  
* Timestamped posts  
* Visible to entire class

---

### **6.4 Timetable & Class Tracking**

For each course:

* Regular class schedule  
* Record of:  
  * Conducted classes  
  * Cancelled classes  
  * Compensatory classes (date & time)  
* Visual weekly timetable  
* Class history log

---

### **6.5 Notes & Resources**

* Upload notes (PDFs, links)  
* Categorization by topic/week  
* Central access per course

---

### **6.6 Unified Student Dashboard**

A **single dashboard** showing:

* All upcoming deadlines (across all courses)  
* Today’s classes  
* Recent announcements  
* Missed tasks alert

---

### **6.7 Notifications & Reminders**

* Deadline reminders:  
  * 3 days before  
  * 1 day before  
  * Same day  
* Announcement alerts  
* Timetable change alerts

*(Email \+ in-app for MVP)*

---

## **7\. Non-Functional Requirements**

### **Performance**

* Page load \< 2 seconds  
* Scalable to hundreds of users per department

### **Security**

* Role-based access control  
* Authentication & authorization  
* Secure file uploads

### **Reliability**

* No data loss for assignments & deadlines  
* Graceful handling of server downtime

### **Usability**

* Minimal clicks  
* Clean UI (student-friendly)  
* Mobile-responsive

---

## **8\. Out of Scope (For MVP)**

* Online assignment submission  
* Grading & marks management  
* Attendance via biometric/QR  
* Parent access  
* LMS replacement (e.g., Moodle)

*(These can be Phase 2 / Phase 3\)*

---

## **9\. Technical Requirements (Suggested Stack)**

### **Frontend**

* **Next.js / React**  
* Tailwind CSS  
* Responsive design

### **Backend**

* **Node.js (Express / Next API routes)**  
* REST APIs

### **Database**

* **PostgreSQL** (recommended)  
* ORM: Prisma / Drizzle

### **Authentication**

* JWT / Session-based  
* Email login (University domain later)

### **Notifications**

* Email (initial)  
* Web push (future)

---

## **10\. Data Model (High-Level)**

### **Entities**

* User  
* Course  
* Enrollment  
* Assignment  
* Announcement  
* ClassSession  
* Resource  
* Notification

---

## **11\. User Flow (Student)**

1. Login  
2. View dashboard  
3. See today’s classes & upcoming deadlines  
4. Open course  
5. View assignments / announcements / notes  
6. Receive reminders automatically

---

## **12\. Risks & Challenges**

* Teacher adoption resistance  
* Data consistency (who updates what)  
* Notification fatigue  
* Scalability if adopted department-wide

---

## **13\. Future Enhancements**

* Assignment submission & grading  
* Calendar sync (Google Calendar)  
* WhatsApp/Telegram bot integration  
* AI-based reminder prioritization  
* Analytics dashboard for students  
* Cross-semester academic history

---

## **14\. Development Phases**

### **Phase 1 (MVP – Semester Break)**

* Authentication  
* Course creation & enrollment  
* Assignments \+ deadlines  
* Announcements  
* Timetable  
* Student dashboard

### **Phase 2**

* Notifications  
* Notes management  
* Teacher analytics

### **Phase 3**

* Submissions  
* Grading  
* Admin dashboard

---

## **15\. Why This Project Matters**

* Solves a **real academic pain**  
* Scalable beyond one department  
* Strong portfolio project  
* Potential for official adoption  
* Demonstrates:  
  * System design  
  * UX thinking  
  * Full-stack engineering  
  * Product thinking