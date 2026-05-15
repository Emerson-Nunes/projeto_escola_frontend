import { Student } from './student';
import { Subject } from './subject';

export interface Attendance {
  id: string;
  studentId: string;
  student?: Student;
  subjectId: string;
  subject?: Subject;
  classRoomId: string;
  date: string;
  present: boolean;
  justified: boolean;
  justification?: string;
}

export interface CreateAttendanceDto {
  studentId: string;
  subjectId: string;
  classRoomId: string;
  date: string;
  present: boolean;
  justified?: boolean;
  justification?: string;
}

export interface BulkAttendanceDto {
  subjectId: string;
  classRoomId: string;
  date: string;
  attendances: { studentId: string; present: boolean; justified?: boolean; justification?: string }[];
}

export interface AttendanceReport {
  studentId: string;
  student: Student;
  subjectId: string;
  subject: Subject;
  totalClasses: number;
  presences: number;
  absences: number;
  percentage: number;
}
