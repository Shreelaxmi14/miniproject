import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  CollegeEvent,
  Registration,
  Feedback,
  Notification,
  SavedEvent,
  DepartmentInfo
} from './types.ts';
import { analyzeSentiment } from './ai_engine.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'campusmilan.json');

export interface DatabaseState {
  users: User[];
  events: CollegeEvent[];
  registrations: Registration[];
  feedback: Feedback[];
  notifications: Notification[];
  saved_events: SavedEvent[];
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'aiml',
    code: 'AI&ML',
    name: 'Artificial Intelligence & Machine Learning',
    iconName: 'Cpu',
    description: 'Neural networks, computer vision, LLMs & robotics',
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'cse',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    iconName: 'Code',
    description: 'Algorithms, full-stack dev, cloud computing & networks',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'ece',
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    iconName: 'Radio',
    description: 'Embedded systems, VLSI, IoT sensors & telecom',
    color: 'from-cyan-500 to-teal-600'
  },
  {
    id: 'mech',
    code: 'MECH',
    name: 'Mechanical Engineering',
    iconName: 'Settings',
    description: 'Robotics kinematics, thermal, CAD/CAM & automotive',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'civil',
    code: 'CIVIL',
    name: 'Civil Engineering',
    iconName: 'Building',
    description: 'Structural designs, smart cities, surveying & green materials',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'cultural',
    code: 'CULT',
    name: 'Cultural & Arts Council',
    iconName: 'Music',
    description: 'Music, theater, dance fests, fine arts & literary debates',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'sports',
    code: 'SPORTS',
    name: 'Sports & Athletics Board',
    iconName: 'Trophy',
    description: 'Track & field, basketball, cricket, football & indoor games',
    color: 'from-red-500 to-amber-600'
  },
  {
    id: 'ise',
    code: 'ISE',
    name: 'Information Science & Engineering',
    iconName: 'Database',
    description: 'Cybersecurity, big data analytics, DevOps & databases',
    color: 'from-sky-500 to-cyan-600'
  }
];

class Database {
  private state: DatabaseState = {
    users: [],
    events: [],
    registrations: [],
    feedback: [],
    notifications: [],
    saved_events: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[Database] Loaded ${this.state.events.length} events, ${this.state.users.length} users from disk.`);
      } else {
        console.log('[Database] Initializing fresh state with seed data...');
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('[Database] Failed to read database, reseeding...', err);
      this.seedInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write data file:', err);
    }
  }

  private seedInitialData() {
    // Generate passwords
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const organizerHash = bcrypt.hashSync('organizer123', salt);
    const studentHash = bcrypt.hashSync('student123', salt);

    const users: User[] = [
      {
        _id: 'usr_admin_1',
        name: 'Dr. Ramesh Sharma',
        email: 'admin@campusmilan.edu',
        usn: 'ADM202401',
        password_hash: adminHash,
        department: 'College Administration',
        year: 0,
        interests: ['Administration', 'Leadership', 'Institutional Excellence'],
        role: 'admin',
        active: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        _id: 'usr_org_1',
        name: 'Priya Sharma',
        email: 'priya@campusmilan.edu',
        usn: '1MS22AI045',
        password_hash: organizerHash,
        department: 'Artificial Intelligence & Machine Learning',
        year: 4,
        interests: ['AI/ML', 'Robotics', 'Python', 'Workshops'],
        role: 'organizer',
        active: true,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        _id: 'usr_org_2',
        name: 'Rahul Verma',
        email: 'rahul@campusmilan.edu',
        usn: '1MS22CS102',
        password_hash: organizerHash,
        department: 'Cultural & Arts Council',
        year: 4,
        interests: ['Cultural', 'Music', 'Drama', 'Photography'],
        role: 'organizer',
        active: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        _id: 'usr_stu_1',
        name: 'Aarav Patel',
        email: 'aarav@campusmilan.edu',
        usn: '1MS23CS012',
        password_hash: studentHash,
        department: 'Computer Science & Engineering',
        year: 3,
        interests: ['AI/ML', 'Web Dev', 'Hackathons', 'Cybersecurity'],
        role: 'student',
        active: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        _id: 'usr_stu_2',
        name: 'Sneha Rao',
        email: 'sneha@campusmilan.edu',
        usn: '1MS24EC088',
        password_hash: studentHash,
        department: 'Electronics & Communication Engineering',
        year: 2,
        interests: ['Robotics', 'IoT', 'Cultural', 'Sports'],
        role: 'student',
        active: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    const events: CollegeEvent[] = [
      {
        _id: 'evt_1',
        title: 'U-Hack 2026: 24-Hour Inter-Collegiate Hackathon',
        description: 'Join the premier flagship hackathon at Apex Institute! Build generative AI solutions, decentralized web apps, or edge IoT systems. Mentors from Google, Microsoft, and leading startups on site with INR 1,50,000 in cash prizes, free swags, and internship fast-track passes.',
        category: 'Hackathons',
        department: 'Computer Science & Engineering',
        date: '2026-11-14',
        time: '09:00 AM',
        venue: 'Digital Innovation Hub, 3rd Floor Auditorium',
        mode: 'offline',
        organizer_id: 'usr_org_1',
        organizer_name: 'Priya Sharma (AI&ML Dept President)',
        poster_url: '/src/assets/images/hackathon_poster_1792854205640.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLScampusHackathon2026/viewform',
        payment_link: 'https://rzp.io/l/uhack2026',
        registration_deadline: '2026-11-10',
        status: 'open',
        photos: [
          '/src/assets/images/campus_fest_hero_1792854205255.jpg',
          '/src/assets/images/hackathon_poster_1792854205640.jpg'
        ],
        approved: true,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString()
      },
      {
        _id: 'evt_2',
        title: 'Dhwanika \'26: Annual Inter-College Cultural Music & Dance Fest',
        description: 'The biggest cultural extravaganza of the semester! Featuring live collegiate battle of bands, classical fusion jugalbandi, street play competitions, solo vocal showdowns, and acoustic night under the stars. Special celebrity artist performance at 7 PM.',
        category: 'Cultural',
        department: 'Cultural & Arts Council',
        date: '2026-11-20',
        time: '04:30 PM',
        venue: 'Main Campus Amphitheater & Open Grounds',
        mode: 'offline',
        organizer_id: 'usr_org_2',
        organizer_name: 'Rahul Verma (Cultural Secretary)',
        poster_url: '/src/assets/images/cultural_fest_poster_1792854206374.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSdhwanika2026/viewform',
        registration_deadline: '2026-11-18',
        status: 'open',
        photos: [
          '/src/assets/images/cultural_fest_poster_1792854206374.jpg'
        ],
        approved: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        _id: 'evt_3',
        title: 'RoboNav 4.0: Autonomous Rovers & Edge AI Workshop',
        description: 'Hands-on practical robotics workshop covering ROS2, SLAM navigation, LiDAR obstacle avoidance, and onboard computer vision model inference with NVIDIA Jetson kits. Hardware kits provided for hands-on team challenges.',
        category: 'Workshops',
        department: 'Artificial Intelligence & Machine Learning',
        date: '2026-11-08',
        time: '10:00 AM',
        venue: 'Robotics & Mechatronics Advanced Lab',
        mode: 'offline',
        organizer_id: 'usr_org_1',
        organizer_name: 'Priya Sharma (AI&ML Dept President)',
        poster_url: '/src/assets/images/robotics_symposium_poster_1792854206316.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSrobonav4workshop/viewform',
        payment_link: 'https://rzp.io/l/robonav2026',
        registration_deadline: '2026-11-05',
        status: 'open',
        photos: [
          '/src/assets/images/robotics_symposium_poster_1792854206316.jpg'
        ],
        approved: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString()
      },
      {
        _id: 'evt_4',
        title: 'Olympus: Inter-Department Athletics & Track Championship',
        description: 'Annual inter-department athletic championship featuring 100m, 400m sprint relays, long jump, shot put, and 5k cross-country marathon. Earn championship rolling trophy points for your department!',
        category: 'Sports',
        department: 'Sports & Athletics Board',
        date: '2026-11-28',
        time: '08:00 AM',
        venue: 'University Central Sports Stadium & Synthetic Track',
        mode: 'offline',
        organizer_id: 'usr_admin_1',
        organizer_name: 'Dr. Ramesh Sharma (Sports Convener)',
        poster_url: '/src/assets/images/sports_meet_poster_1792854207166.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSolympusSportsMeet/viewform',
        registration_deadline: '2026-11-24',
        status: 'open',
        photos: [
          '/src/assets/images/sports_meet_poster_1792854207166.jpg'
        ],
        approved: true,
        created_at: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        _id: 'evt_5',
        title: 'Full-Stack Web3 & Microservices Architecture Masterclass',
        description: 'Deep dive into event-driven backend microservices, high-concurrency systems, GraphQL gateway design, and blockchain smart contract integration. Included live code labs and deployment to Cloud Run.',
        category: 'Seminars',
        department: 'Information Science & Engineering',
        date: '2026-10-18', // Past event to demonstrate completed event review & photos
        time: '02:00 PM',
        venue: 'Virtual Seminar Room (Google Meet)',
        mode: 'online',
        organizer_id: 'usr_org_1',
        organizer_name: 'Priya Sharma (AI&ML Dept President)',
        poster_url: '/src/assets/images/hackathon_poster_1792854205640.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSweb3seminar/viewform',
        registration_deadline: '2026-10-15',
        status: 'closed',
        photos: [
          '/src/assets/images/campus_fest_hero_1792854205255.jpg'
        ],
        approved: true,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        _id: 'evt_6',
        title: 'VLSI Chip Design & Semiconductor Fabrication Symposium',
        description: 'National technical symposium on 3nm FinFET architecture, FPGA synthesis with Verilog, and semiconductor packaging trends with guest researchers from Intel Labs and ISRO.',
        category: 'Seminars',
        department: 'Electronics & Communication Engineering',
        date: '2026-11-25',
        time: '11:00 AM',
        venue: 'ECE Seminar Hall 2, Sir MV Block',
        mode: 'offline',
        organizer_id: 'usr_org_1',
        organizer_name: 'Priya Sharma (AI&ML Dept President)',
        poster_url: '/src/assets/images/robotics_symposium_poster_1792854206316.jpg',
        google_form_link: 'https://docs.google.com/forms/d/e/1FAIpQLSvlsisymposium2026/viewform',
        registration_deadline: '2026-11-21',
        status: 'open',
        photos: [],
        approved: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    const registrations: Registration[] = [
      {
        _id: 'reg_1',
        student_id: 'usr_stu_1',
        student_name: 'Aarav Patel',
        student_usn: '1MS23CS012',
        student_email: 'aarav@campusmilan.edu',
        student_department: 'Computer Science & Engineering',
        event_id: 'evt_1',
        registered_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        attended: true
      },
      {
        _id: 'reg_2',
        student_id: 'usr_stu_1',
        student_name: 'Aarav Patel',
        student_usn: '1MS23CS012',
        student_email: 'aarav@campusmilan.edu',
        student_department: 'Computer Science & Engineering',
        event_id: 'evt_5',
        registered_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        attended: true
      },
      {
        _id: 'reg_3',
        student_id: 'usr_stu_2',
        student_name: 'Sneha Rao',
        student_usn: '1MS24EC088',
        student_email: 'sneha@campusmilan.edu',
        student_department: 'Electronics & Communication Engineering',
        event_id: 'evt_2',
        registered_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        attended: false
      },
      {
        _id: 'reg_4',
        student_id: 'usr_stu_2',
        student_name: 'Sneha Rao',
        student_usn: '1MS24EC088',
        student_email: 'sneha@campusmilan.edu',
        student_department: 'Electronics & Communication Engineering',
        event_id: 'evt_3',
        registered_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        attended: false
      }
    ];

    const feedback: Feedback[] = [
      {
        _id: 'fb_1',
        student_id: 'usr_stu_1',
        student_name: 'Aarav Patel',
        student_department: 'Computer Science & Engineering',
        event_id: 'evt_5',
        rating: 5,
        comment: 'Brilliant workshop! The hands-on microservices deployment was super insightful and well-organized.',
        sentiment: 'positive',
        created_at: new Date(Date.now() - 19 * 86400000).toISOString()
      },
      {
        _id: 'fb_2',
        student_id: 'usr_stu_2',
        student_name: 'Sneha Rao',
        student_department: 'Electronics & Communication Engineering',
        event_id: 'evt_5',
        rating: 4,
        comment: 'Great content and engaging speaker, although the last section felt a bit fast.',
        sentiment: 'positive',
        created_at: new Date(Date.now() - 18 * 86400000).toISOString()
      }
    ];

    const notifications: Notification[] = [
      {
        _id: 'notif_1',
        student_id: 'usr_stu_1',
        event_id: 'evt_1',
        message: 'New Event matching your interests: U-Hack 2026: 24-Hour Hackathon registration is now open!',
        read: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        _id: 'notif_2',
        student_id: 'usr_stu_1',
        event_id: 'evt_3',
        message: 'RoboNav 4.0: Autonomous Rovers & Edge AI Workshop announced by AI&ML Department.',
        read: false,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        _id: 'notif_3',
        student_id: 'usr_stu_2',
        event_id: 'evt_2',
        message: 'Dhwanika \'26 Cultural Music & Dance Fest dates announced!',
        read: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    const saved_events: SavedEvent[] = [
      {
        _id: 'save_1',
        student_id: 'usr_stu_1',
        event_id: 'evt_1',
        saved_at: new Date().toISOString()
      }
    ];

    this.state = {
      users,
      events,
      registrations,
      feedback,
      notifications,
      saved_events
    };
  }

  // --- User Operations ---
  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u._id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByUSN(usn: string): User | undefined {
    return this.state.users.find(u => u.usn.toLowerCase() === usn.toLowerCase());
  }

  createUser(userData: Omit<User, '_id' | 'created_at'>): User {
    const newUser: User = {
      ...userData,
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.state.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.state.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.persist();
    return this.state.users[idx];
  }

  // --- Event Operations ---
  getEvents(options?: {
    departments?: string[];
    category?: string;
    status?: string;
    search?: string;
    organizerId?: string;
  }): CollegeEvent[] {
    let result = [...this.state.events];

    if (options?.departments && options.departments.length > 0) {
      const depts = options.departments.map(d => d.toLowerCase());
      result = result.filter(e => depts.some(d => e.department.toLowerCase().includes(d)));
    }

    if (options?.category && options.category !== 'all') {
      result = result.filter(e => e.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.status && options.status !== 'all') {
      result = result.filter(e => e.status === options.status);
    }

    if (options?.organizerId) {
      result = result.filter(e => e.organizer_id === options.organizerId);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }

    // Attach computed stats
    return result.map(e => this.enrichEventStats(e));
  }

  getEventById(id: string): CollegeEvent | null {
    const ev = this.state.events.find(e => e._id === id);
    if (!ev) return null;
    return this.enrichEventStats(ev);
  }

  private enrichEventStats(event: CollegeEvent): CollegeEvent {
    const regs = this.state.registrations.filter(r => r.event_id === event._id);
    const fbs = this.state.feedback.filter(f => f.event_id === event._id);
    const avgRating = fbs.length > 0 
      ? Number((fbs.reduce((acc, curr) => acc + curr.rating, 0) / fbs.length).toFixed(1))
      : 5.0;

    return {
      ...event,
      registration_count: regs.length,
      feedback_count: fbs.length,
      average_rating: avgRating
    };
  }

  createEvent(eventData: Omit<CollegeEvent, '_id' | 'created_at' | 'approved'>): CollegeEvent {
    const newEvent: CollegeEvent = {
      ...eventData,
      _id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      approved: true,
      photos: eventData.photos || [],
      created_at: new Date().toISOString()
    };
    this.state.events.push(newEvent);

    // Auto-generate notifications for students whose interests match this event's category or department!
    this.notifyMatchingStudents(newEvent);

    this.persist();
    return this.enrichEventStats(newEvent);
  }

  updateEvent(id: string, updates: Partial<CollegeEvent>): CollegeEvent | null {
    const idx = this.state.events.findIndex(e => e._id === id);
    if (idx === -1) return null;
    this.state.events[idx] = { ...this.state.events[idx], ...updates };
    this.persist();
    return this.enrichEventStats(this.state.events[idx]);
  }

  deleteEvent(id: string): boolean {
    const initialLen = this.state.events.length;
    this.state.events = this.state.events.filter(e => e._id !== id);
    this.state.registrations = this.state.registrations.filter(r => r.event_id !== id);
    this.state.feedback = this.state.feedback.filter(f => f.event_id !== id);
    this.state.notifications = this.state.notifications.filter(n => n.event_id !== id);
    this.state.saved_events = this.state.saved_events.filter(s => s.event_id !== id);
    this.persist();
    return this.state.events.length < initialLen;
  }

  addEventPhotos(eventId: string, newPhotos: string[]): CollegeEvent | null {
    const ev = this.state.events.find(e => e._id === eventId);
    if (!ev) return null;
    ev.photos = Array.from(new Set([...(ev.photos || []), ...newPhotos]));
    this.persist();
    return this.enrichEventStats(ev);
  }

  // --- Registration Operations ---
  getRegistrations(eventId?: string, studentId?: string): Registration[] {
    let result = [...this.state.registrations];
    if (eventId) {
      result = result.filter(r => r.event_id === eventId);
    }
    if (studentId) {
      result = result.filter(r => r.student_id === studentId);
    }
    return result;
  }

  createRegistration(student: User, eventId: string): { success: boolean; registration?: Registration; message?: string } {
    const ev = this.state.events.find(e => e._id === eventId);
    if (!ev) {
      return { success: false, message: 'Event not found' };
    }
    if (ev.status === 'closed') {
      return { success: false, message: 'Registrations are closed for this event' };
    }

    const existing = this.state.registrations.find(
      r => r.student_id === student._id && r.event_id === eventId
    );
    if (existing) {
      return { success: false, message: 'Student is already registered for this event', registration: existing };
    }

    const newReg: Registration = {
      _id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: student._id,
      student_name: student.name,
      student_usn: student.usn,
      student_email: student.email,
      student_department: student.department,
      event_id: eventId,
      registered_at: new Date().toISOString(),
      attended: false
    };

    this.state.registrations.push(newReg);
    this.persist();
    return { success: true, registration: newReg };
  }

  // --- Feedback Operations ---
  getFeedbacks(eventId?: string): Feedback[] {
    if (eventId) {
      return this.state.feedback.filter(f => f.event_id === eventId);
    }
    return this.state.feedback;
  }

  createFeedback(student: User, eventId: string, rating: number, comment: string): Feedback {
    // Run sentiment analysis automatically
    const { sentiment } = analyzeSentiment(comment);

    const newFeedback: Feedback = {
      _id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: student._id,
      student_name: student.name,
      student_department: student.department,
      event_id: eventId,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      sentiment,
      created_at: new Date().toISOString()
    };

    this.state.feedback.push(newFeedback);
    this.persist();
    return newFeedback;
  }

  // --- Notifications Operations ---
  getNotifications(studentId: string): Notification[] {
    return this.state.notifications
      .filter(n => n.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  markNotificationsRead(studentId: string): void {
    let changed = false;
    this.state.notifications.forEach(n => {
      if (n.student_id === studentId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) this.persist();
  }

  private notifyMatchingStudents(event: CollegeEvent) {
    const students = this.state.users.filter(u => u.role === 'student' && u.active);
    for (const student of students) {
      const matchesCategory = student.interests.some(i =>
        event.category.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(event.category.toLowerCase()) ||
        event.title.toLowerCase().includes(i.toLowerCase())
      );
      const matchesDept = event.department.toLowerCase().includes(student.department.toLowerCase());

      if (matchesCategory || matchesDept) {
        const notif: Notification = {
          _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          student_id: student._id,
          event_id: event._id,
          message: `New Event: "${event.title}" matches your profile (${event.category} · ${event.department})!`,
          read: false,
          created_at: new Date().toISOString()
        };
        this.state.notifications.push(notif);
      }
    }
  }

  // --- Saved / Calendar Operations ---
  getSavedEvents(studentId: string): CollegeEvent[] {
    const savedIds = new Set(
      this.state.saved_events.filter(s => s.student_id === studentId).map(s => s.event_id)
    );
    return this.state.events.filter(e => savedIds.has(e._id)).map(e => this.enrichEventStats(e));
  }

  toggleSaveEvent(studentId: string, eventId: string): { saved: boolean } {
    const idx = this.state.saved_events.findIndex(
      s => s.student_id === studentId && s.event_id === eventId
    );
    if (idx !== -1) {
      this.state.saved_events.splice(idx, 1);
      this.persist();
      return { saved: false };
    } else {
      this.state.saved_events.push({
        _id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        student_id: studentId,
        event_id: eventId,
        saved_at: new Date().toISOString()
      });
      this.persist();
      return { saved: true };
    }
  }

  // --- Admin Analytics ---
  getAnalytics() {
    const totalEvents = this.state.events.length;
    const totalRegistrations = this.state.registrations.length;
    const totalStudents = this.state.users.filter(u => u.role === 'student').length;
    const totalOrganizers = this.state.users.filter(u => u.role === 'organizer').length;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    this.state.events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    // Department participation (event count + registration count)
    const deptStats: Record<string, { events: number; registrations: number }> = {};
    DEPARTMENTS.forEach(d => {
      deptStats[d.name] = { events: 0, registrations: 0 };
    });

    this.state.events.forEach(e => {
      const match = Object.keys(deptStats).find(k => k.toLowerCase().includes(e.department.toLowerCase()) || e.department.toLowerCase().includes(k.toLowerCase()));
      const key = match || e.department;
      if (!deptStats[key]) deptStats[key] = { events: 0, registrations: 0 };
      deptStats[key].events += 1;
    });

    this.state.registrations.forEach(r => {
      const ev = this.state.events.find(e => e._id === r.event_id);
      if (ev) {
        const match = Object.keys(deptStats).find(k => k.toLowerCase().includes(ev.department.toLowerCase()) || ev.department.toLowerCase().includes(k.toLowerCase()));
        const key = match || ev.department;
        if (!deptStats[key]) deptStats[key] = { events: 0, registrations: 0 };
        deptStats[key].registrations += 1;
      }
    });

    // Feedback sentiment breakdown
    const sentimentCounts = {
      positive: this.state.feedback.filter(f => f.sentiment === 'positive').length,
      neutral: this.state.feedback.filter(f => f.sentiment === 'neutral').length,
      negative: this.state.feedback.filter(f => f.sentiment === 'negative').length
    };

    const avgRating = this.state.feedback.length > 0
      ? Number((this.state.feedback.reduce((sum, f) => sum + f.rating, 0) / this.state.feedback.length).toFixed(1))
      : 4.8;

    return {
      totalEvents,
      totalRegistrations,
      totalStudents,
      totalOrganizers,
      avgRating,
      categoryCounts,
      deptStats,
      sentimentCounts,
      recentFeedbacks: this.state.feedback.slice(-5).reverse()
    };
  }

  // --- Public Highlights for Landing Page ---
  getPublicHighlights() {
    const allEvents = this.state.events.map(e => this.enrichEventStats(e));
    
    // Collect carousel photos from all past and current events
    const carouselPhotos: { url: string; title: string; category: string; department: string; date: string }[] = [];
    allEvents.forEach(e => {
      if (e.photos && e.photos.length > 0) {
        e.photos.forEach(photo => {
          carouselPhotos.push({
            url: photo,
            title: e.title,
            category: e.category,
            department: e.department,
            date: e.date
          });
        });
      }
    });

    // Sort events by popularity (registration count)
    const trendingEvents = [...allEvents]
      .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
      .slice(0, 4);

    return {
      stats: {
        totalEvents: allEvents.length,
        totalRegistrations: this.state.registrations.length,
        departmentsCount: DEPARTMENTS.length,
        satisfactionRate: '96%'
      },
      carouselPhotos,
      trendingEvents,
      departments: DEPARTMENTS
    };
  }
}

export const db = new Database();
