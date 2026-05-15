import { Student } from './student';
import { Subject } from './subject';

export interface Grade {
  id: string;
  studentId: string;
  student?: Student;
  subjectId: string;
  subject?: Subject;
  classRoomId: string;
  schoolYear: number;
  bimester: 1 | 2 | 3 | 4;
  value: number;
  recoveryValue?: number;
  finalBimesterValue: number;
}

export interface CreateGradeDto {
  studentId: string;
  subjectId: string;
  classRoomId: string;
  schoolYear: number;
  bimester: 1 | 2 | 3 | 4;
  value: number;
  recoveryValue?: number;
}

export interface BulkGradeDto {
  subjectId: string;
  classRoomId: string;
  schoolYear: number;
  bimester: 1 | 2 | 3 | 4;
  grades: { studentId: string; value: number; recoveryValue?: number }[];
}

export interface ReportCardBimester {
  bimester: number;
  value: number;
  recoveryValue?: number;
  finalValue: number;
}

export interface ReportCardSubject {
  subject: Subject;
  bimesters: ReportCardBimester[];
  media1: number;
  media2: number;
  mediaFinal: number;
  status: 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';
}

export interface ReportCard {
  student: Student;
  subjects: ReportCardSubject[];
}
