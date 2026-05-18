import { Subject } from './subject';

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address: string;
  registrationNumber: string;
  subjects?: Subject[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateTeacherDto {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address?: string;
  registrationNumber: string;
}

export type UpdateTeacherDto = Partial<CreateTeacherDto>;
