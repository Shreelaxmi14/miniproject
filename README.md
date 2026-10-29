# CampusMilan: AI-Powered College Event Discovery, Recommendation & Management Platform

**CampusMilan** is a centralized college event platform designed for university campuses. It unifies scattered event announcements from WhatsApp groups, flyers, and notice boards into one intelligent, personalized web application.

---

## 🚀 Key Features

### 1. Public Landing Page
- **College Header & Banner**: Apex Institute of Technology & Engineering central portal.
- **Auto-Sliding Carousel**: Highlights recent event recap photos uploaded by organizers.
- **Two Prominent Action CTAs**: "Student Login" and "Organizer Login" with 1-click test credentials.
- **Past Event Photo Gallery**: Visual archive with interactive photo lightbox.

### 2. Student Experience
- **USN Authentication**: Student registration and login using University Seat Number (USN), department, year of study, and multi-select interests.
- **Department Logos Grid**: Visually appealing grid of department emblems (2 per row on mobile/tablet) with hover animations.
- **Multi-Department Filtering**: Select multiple departments simultaneously to explore cross-disciplinary events.
- **AI Recommendation Engine**: Ranks events using **TF-IDF + Cosine Similarity** between the student's profile/interest vectors and event descriptions. Displays match percentage (e.g., 94% Match) and explanation tags.
- **Event Action Suite**:
  - Google Forms external registration button.
  - Interactive **QR Code generator** for instant smartphone scanning.
  - In-app quick registration confirmation.
  - Save / bookmark to personal calendar.
  - Star rating (1–5) and comment feedback with real-time **AI sentiment analysis**.
- **Personal Calendar & Reminders**: Tracks saved and registered events with countdown days left.
- **Notification Bell**: Live unread badge count for new events matching student interests.

### 3. Organizer (Department President) Experience
- **Create & Edit Events**: Title, description, category, date, time, venue, mode (online/offline), poster, Google Form link, payment link, and registration deadline.
- **Toggle Registration Status**: 1-click toggle between `Open` and `Closed`.
- **Post-Event Photo Upload**: Upload 1–2 recap photos after an event ends, instantly appearing on the public homepage carousel.
- **Attendee Tracking**: View full roster of registered students with USN, name, email, department, and timestamp.
- **Feedback & Rating Audit**: View student ratings and AI sentiment classification (Positive / Neutral / Critical).
- **Edit & Delete**: Full management control over department events.

### 4. Admin (College Administration) Experience
- **Analytics & KPI Dashboard**:
  - Total events, registrations, active student cohort, and satisfaction rating.
  - Category popularity distribution chart.
  - Department-wise participation and registration turnout chart.
  - AI feedback sentiment polarity breakdown (Positive %, Neutral %, Critical %).
- **User Management**: Search, filter by role, and activate/deactivate accounts.
- **Moderation Queue**: Approve or revoke approval for organizer events.
- **College-wide Feedback Explorer**: Review attendee feedback across all departments.

---

## 🧠 AI / ML Components

1. **TF-IDF Vectorizer**: Tokenizes, cleans stopwords, calculates Term Frequency (TF), and Inverse Document Frequency (IDF) across event titles, categories, departments, and descriptions.
2. **Cosine Similarity Matcher**: Converts student profile (interests, department, year) into query vectors and computes normalized dot product against all event vectors.
3. **Smart Multi-Department Ranking**: When multiple departments are selected, results are ranked by contextual relevance scores.
4. **Interest-Based Notifications**: Automatically notifies students whose profiles match new events when created by organizers.
5. **Feedback Sentiment Analysis**: Lexicon-based polarity classification scoring student reviews as `Positive`, `Neutral`, or `Critical`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide React icons, Motion
- **Backend**: Node.js with Express 4, TypeScript (running via tsx)
- **Dev Server**: Vite 8 with Express integration on port 3000
- **Database**: Persistent disk-backed JSON document store in `.data/campusmilan.json`
- **Authentication**: JWT tokens + bcrypt password hashing
- **QR Code**: `qrcode` library generating high-res data URLs

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create student or organizer account
- `POST /api/auth/login` — Sign in with Email/USN and password
- `POST /api/auth/demo-login` — 1-click instant login as student, organizer, or admin
- `GET /api/auth/me` — Verify session and return current user profile

### Events (`/api/events`)
- `GET /api/events` — List events with filters (`departments`, `category`, `status`, `search`, `sortBy`)
- `GET /api/events/recommended` — AI personalized recommendations using TF-IDF + cosine similarity
- `GET /api/events/public-highlights` — Public carousel photos, trending events, and statistics
- `GET /api/events/:id` — Event details, registrations, and reviews
- `POST /api/events` — Create event (Organizer/Admin only)
- `PUT /api/events/:id` — Update event or toggle registration status
- `DELETE /api/events/:id` — Delete event
- `POST /api/events/:id/photos` — Upload post-event recap photos for public carousel
- `POST /api/events/:id/register` — Register student for event
- `GET /api/events/:id/registrations` — View registered students (Organizer/Admin only)
- `POST /api/events/:id/feedback` — Submit rating and comment (triggers AI sentiment analysis)
- `GET /api/events/:id/feedback` — List feedback for event
- `POST /api/events/:id/save` — Toggle save/bookmark in calendar
- `GET /api/events/:id/qrcode` — Generate registration QR code data URL

### Student Calendar & Notifications (`/api/student`)
- `GET /api/student/calendar` — Get saved and registered events with countdowns
- `GET /api/student/notifications` — Get interest-matched notifications and unread count
- `POST /api/student/notifications/read-all` — Mark notifications as read
- `GET /api/student/my-registrations` — Get events registered by student

### College Admin (`/api/admin`)
- `GET /api/admin/analytics` — KPI metrics, charts data, department participation, and sentiment stats
- `GET /api/admin/users` — List all registered users
- `POST /api/admin/users/:id/toggle-status` — Activate or deactivate user account
- `POST /api/admin/events/:id/moderate` — Approve or reject event

---

## 🔑 Pre-Seeded Demo Accounts

For rapid evaluation testing, use the 1-click switcher in the top notice bar, login modal, or test with:

| Role | Name | Email / USN | Password |
|---|---|---|---|
| **Student** | Aarav Patel | `aarav@campusmilan.edu` / `1MS23CS012` | `student123` |
| **Student 2** | Sneha Rao | `sneha@campusmilan.edu` / `1MS24EC088` | `student123` |
| **Organizer** | Priya Sharma (AI&ML Dept President) | `priya@campusmilan.edu` / `1MS22AI045` | `organizer123` |
| **College Admin** | Dr. Ramesh Sharma (Dean of Students) | `admin@campusmilan.edu` / `ADM202401` | `admin123` |
