export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  usn: string;
  department: string;
  year: number;
  interests: string[];
  role: UserRole;
  active: boolean;
  created_at: string;
}

export type EventStatus = 'open' | 'closed';
export type EventMode = 'online' | 'offline';

export interface CollegeEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  date: string;
  time: string;
  venue: string;
  mode: EventMode;
  organizer_id: string;
  organizer_name: string;
  poster_url: string;
  google_form_link: string;
  payment_link?: string;
  registration_deadline: string;
  status: EventStatus;
  photos: string[];
  approved: boolean;
  created_at: string;
  registration_count?: number;
  average_rating?: number;
  feedback_count?: number;
}

export interface RecommendationResult {
  event: CollegeEvent;
  score: number;
  matchPercentage: number;
  matchedKeywords: string[];
  relevanceReason: string;
}

export interface Registration {
  _id: string;
  student_id: string;
  student_name: string;
  student_usn: string;
  student_email: string;
  student_department: string;
  event_id: string;
  registered_at: string;
  attended: boolean;
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface Feedback {
  _id: string;
  student_id: string;
  student_name: string;
  student_department: string;
  event_id: string;
  rating: number;
  comment: string;
  sentiment: SentimentType;
  created_at: string;
}

export interface Notification {
  _id: string;
  student_id: string;
  event_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
  color: string;
}
