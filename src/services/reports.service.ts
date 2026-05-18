import api from './api';

export const reportsService = {
  async downloadReportCard(studentId: string, schoolYear: number): Promise<Blob> {
    const { data } = await api.get(`/reports/report-card/${studentId}`, {
      params: { schoolYear },
      responseType: 'blob',
    });
    return data;
  },

  async downloadClassReport(classRoomId: string, schoolYear: number): Promise<Blob> {
    const { data } = await api.get(`/reports/class/${classRoomId}`, {
      params: { schoolYear },
      responseType: 'blob',
    });
    return data;
  },

  async downloadGradesSheet(classRoomId: string, schoolYear: number): Promise<Blob> {
    const { data } = await api.get(`/reports/grades-sheet/${classRoomId}`, {
      params: { schoolYear },
      responseType: 'blob',
    });
    return data;
  },

  async downloadStudentAttendance(studentId: string, schoolYear?: number): Promise<Blob> {
    const { data } = await api.get(`/reports/student/${studentId}/attendance`, {
      params: schoolYear ? { schoolYear } : {},
      responseType: 'blob',
    });
    return data;
  },

  async downloadAttendanceSheet(classRoomId: string, subjectId: string, startDate: string, endDate: string): Promise<Blob> {
    const { data } = await api.get('/reports/attendance-sheet', {
      params: { classRoomId, subjectId, startDate, endDate },
      responseType: 'blob',
    });
    return data;
  },

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
