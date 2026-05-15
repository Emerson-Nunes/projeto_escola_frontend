import api from './api';
import { Student, CreateStudentDto, UpdateStudentDto } from '../types/student';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

interface StudentFilters extends PaginationParams {
  classRoomId?: string;
  isActive?: boolean;
}

export const studentsService = {
  async findAll(params?: StudentFilters): Promise<PaginatedResponse<Student>> {
    const { data } = await api.get<PaginatedResponse<Student>>('/students', { params });
    return data;
  },

  async findById(id: string): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`);
    return data;
  },

  async create(dto: CreateStudentDto): Promise<Student> {
    const { data } = await api.post<Student>('/students', dto);
    return data;
  },

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const { data } = await api.patch<Student>(`/students/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  async findMe(): Promise<Student> {
    const { data } = await api.get<Student>('/students/me');
    return data;
  },
};
