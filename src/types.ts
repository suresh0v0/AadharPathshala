export type SubjectType = 'English' | 'नेपाली' | 'Maths' | 'Science'| 'सामाजिक' | 'Optional Maths' | 'Account' | 'Computer' | 'Economics' | 'Health';

export interface Chapter {
  id: string;
  title: string;
  topics?: string;
  marks?: number;
  contentHtml?: string;
}

export interface Video {
  id: string;
  title: string;
  channel: string;
  youtubeId: string;
  duration: string;
}

export interface PDF {
  id: string;
  name: string;
  desc: string;
  url: string;
}

export interface ModelQuestion {
  id: string;
  q: string;
  answerHtml?: string;
}

export interface SubjectData {
  id: SubjectType;
  color: string;
  icon: string;
  chapters: Chapter[];
  notesHtml?: string;
  videos: Video[];
  pdfs: PDF[];
  modelQuestions: ModelQuestion[];
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  date: string;
  imageUrl?: string;
  tag: string;
  tagColor: string;
  tagBg: string;
}

export interface AppSettings {
  welcomeMessage: string;
  registrationOpen: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'mock' | 'deadline' | 'holiday';
  description?: string;
}

export interface AppData {
  news: NewsItem[];
  subjects: Record<string, SubjectData>;
  calendar: CalendarEvent[];
  settings: AppSettings;
}

export interface User {
  id: string;
  name: string;
  email: string;
  grade: string;
  completedChapters: string[]; // List of chapter IDs
  streak: number;
  lastStudyDate?: string; // ISO date string
  xp?: number;
  photoURL?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  grade: string;
  streak: number;
  isCurrentUser?: boolean;
}
