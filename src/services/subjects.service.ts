import api from './api';
import { Subject, CreateSubjectDto, UpdateSubjectDto } from '../types/subject';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

export const subjectsService = {
  async findAll(params?: PaginationParams): Promise<PaginatedResponse<Subject>> {
    const { data } = await api.get<PaginatedResponse<Subject>>('/subjects', { params });
    return data;
  },

  async findById(id: string): Promise<Subject> {
    const { data } = await api.get<Subject>(`/subjects/${id}`);
    return data;
  },

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const { data } = await api.post<Subject>('/subjects', dto);
    return data;
  },

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    const { data } = await api.patch<Subject>(`/subjects/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },
};
