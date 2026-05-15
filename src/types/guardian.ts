import { Student } from './student';

export interface Guardian {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  relationship: string;
  students?: Student[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateGuardianDto {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  address: string;
  relationship: string;
}

export type UpdateGuardianDto = Partial<CreateGuardianDto>;
