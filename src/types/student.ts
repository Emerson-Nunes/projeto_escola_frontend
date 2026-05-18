import { ClassRoom } from './classroom';
import { Guardian } from './guardian';

export interface Student {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
  enrollmentNumber: string;
  classRoomId: string;
  classRoom?: ClassRoom;
  guardianId?: string;
  guardian?: Guardian;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStudentDto {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address?: string;
  enrollmentNumber?: string;
  classRoomId: string;
  guardianId?: string;
}

export type UpdateStudentDto = Partial<CreateStudentDto>;
