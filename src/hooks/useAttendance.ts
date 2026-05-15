import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { BulkAttendanceDto } from '../types/attendance';

export const ATTENDANCE_KEY = 'attendance';

export function useAttendanceByClassRoom(
  classRoomId: string,
  subjectId: string,
  date: string
) {
  return useQuery({
    queryKey: [ATTENDANCE_KEY, classRoomId, subjectId, date],
    queryFn: () => attendanceService.findByClassRoom(classRoomId, subjectId, date),
    enabled: !!classRoomId && !!subjectId && !!date,
  });
}

export function useAttendanceReport(params: {
  classRoomId?: string;
  subjectId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [ATTENDANCE_KEY, 'report', params],
    queryFn: () => attendanceService.getReport(params),
    enabled: !!(params.classRoomId || params.studentId),
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkAttendanceDto) => attendanceService.bulkCreate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] });
    },
  });
}
