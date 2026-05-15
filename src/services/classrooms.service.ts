import api from './api';
import { ClassRoom, CreateClassRoomDto, UpdateClassRoomDto } from '../types/classroom';
import { Student } from '../types/student';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

export const classroomsService = {
  async findAll(params?: PaginationParams): Promise<PaginatedResponse<ClassRoom>> {
    const { data } = await api.get<PaginatedResponse<ClassRoom>>('/classrooms', { params });
    return data;
  },

  async findById(id: string): Promise<ClassRoom> {
    const { data } = await api.get<ClassRoom>(`/classrooms/${id}`);
    return data;
  },

  async findStudents(id: string, search?: string): Promise<PaginatedResponse<Student>> {
    const { data } = await api.get<PaginatedResponse<Student>>(`/classrooms/${id}/students`, { params: { search, limit: 200 } });
    return data;
  },

  async create(dto: CreateClassRoomDto): Promise<ClassRoom> {
    const { data } = await api.post<ClassRoom>('/classrooms', dto);
    return data;
  },

  async update(id: string, dto: UpdateClassRoomDto): Promise<ClassRoom> {
    const { data } = await api.patch<ClassRoom>(`/classrooms/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/classrooms/${id}`);
  },
};
