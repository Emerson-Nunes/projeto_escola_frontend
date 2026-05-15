import api from './api';
import { Guardian, CreateGuardianDto, UpdateGuardianDto } from '../types/guardian';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

export const guardiansService = {
  async findAll(params?: PaginationParams): Promise<PaginatedResponse<Guardian>> {
    const { data } = await api.get<PaginatedResponse<Guardian>>('/guardians', { params });
    return data;
  },

  async findById(id: string): Promise<Guardian> {
    const { data } = await api.get<Guardian>(`/guardians/${id}`);
    return data;
  },

  async create(dto: CreateGuardianDto): Promise<Guardian> {
    const { data } = await api.post<Guardian>('/guardians', dto);
    return data;
  },

  async update(id: string, dto: UpdateGuardianDto): Promise<Guardian> {
    const { data } = await api.patch<Guardian>(`/guardians/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/guardians/${id}`);
  },

  async findMe(): Promise<Guardian & { students: any[] }> {
    const { data } = await api.get<Guardian & { students: any[] }>('/guardians/me');
    return data;
  },
};
