export interface ClassRoom {
  id: string;
  name: string;
  year: number;
  shift: 'MANHA' | 'TARDE' | 'NOITE';
  grade: 1 | 2 | 3;
  isActive: boolean;
  studentCount?: number;
}

export interface CreateClassRoomDto {
  name: string;
  year: number;
  shift: 'MANHA' | 'TARDE' | 'NOITE';
  grade: 1 | 2 | 3;
}

export type UpdateClassRoomDto = Partial<CreateClassRoomDto>;
