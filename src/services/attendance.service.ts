import api from './api';
import { Attendance, BulkAttendanceDto, AttendanceReport } from '../types/attendance';

export const attendanceService = {
  async findByClassRoom(classRoomId: string, subjectId: string, date: string): Promise<Attendance[]> {
    const { data } = await api.get<Attendance[]>('/attendance', {
      params: { classRoomId, subjectId, date },
    });
    return data;
  },

  async bulkCreate(dto: BulkAttendanceDto): Promise<Attendance[]> {
    const { data } = await api.post<Attendance[]>('/attendance/bulk', dto);
    return data;
  },

  async getReport(params: {
    classRoomId?: string;
    subjectId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceReport[]> {
    const { data } = await api.get<AttendanceReport[]>('/attendance/report', { params });
    return data;
  },

  async update(id: string, dto: Partial<{ present: boolean; justified: boolean; justification: string }>): Promise<Attendance> {
    const { data } = await api.patch<Attendance>(`/attendance/${id}`, dto);
    return data;
  },
};
