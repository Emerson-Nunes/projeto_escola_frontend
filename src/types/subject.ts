export interface Subject {
  id: string;
  name: string;
  code: string;
  workload: number;
  teacherId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  workload: number;
  teacherId?: string;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;
