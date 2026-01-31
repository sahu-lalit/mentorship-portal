export type UserRole = 'student' | 'mentor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Student extends User {
  role: 'student';
  enrollmentDate: string;
  currentLevel?: string;
}

export interface Mentor extends User {
  role: 'mentor';
  expertise: string[];
  yearsOfExperience?: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}
