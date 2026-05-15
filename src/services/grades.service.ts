import api from './api';
import { Grade, CreateGradeDto, BulkGradeDto, ReportCard } from '../types/grade';

export const gradesService = {
  async findByStudent(studentId: string, schoolYear?: number): Promise<Grade[]> {
    const { data } = await api.get<Grade[]>(`/grades/student/${studentId}`, {
      params: { schoolYear },
    });
    return data;
  },

  async findByClassRoom(classRoomId: string, subjectId: string, bimester: number, schoolYear: number): Promise<Grade[]> {
    const { data } = await api.get<Grade[]>('/grades', {
      params: { classRoomId, subjectId, bimester, schoolYear },
    });
    return data;
  },

  async create(dto: CreateGradeDto): Promise<Grade> {
    const { data } = await api.post<Grade>('/grades', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateGradeDto>): Promise<Grade> {
    const { data } = await api.patch<Grade>(`/grades/${id}`, dto);
    return data;
  },

  async bulkCreate(dto: BulkGradeDto): Promise<Grade[]> {
    const { data } = await api.post<Grade[]>('/grades/bulk', dto);
    return data;
  },

  async getReportCard(studentId: string, schoolYear?: number): Promise<ReportCard> {
    const { data } = await api.get<ReportCard>(`/grades/student/${studentId}/reportcard`, {
      params: schoolYear ? { schoolYear } : {},
    });
    return data;
  },
};
