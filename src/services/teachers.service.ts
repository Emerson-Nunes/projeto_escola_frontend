import api from './api';
import { Teacher, CreateTeacherDto, UpdateTeacherDto } from '../types/teacher';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

export const teachersService = {
  async findAll(params?: PaginationParams): Promise<PaginatedResponse<Teacher>> {
    const { data } = await api.get<PaginatedResponse<Teacher>>('/teachers', { params });
    return data;
  },

  async findById(id: string): Promise<Teacher> {
    const { data } = await api.get<Teacher>(`/teachers/${id}`);
    return data;
  },

  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const { data } = await api.post<Teacher>('/teachers', dto);
    return data;
  },

  async update(id: string, dto: UpdateTeacherDto): Promise<Teacher> {
    const { data } = await api.patch<Teacher>(`/teachers/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/teachers/${id}`);
  },

  async findMe(): Promise<Teacher> {
    const { data } = await api.get<Teacher>('/teachers/me');
    return data;
  },
};
