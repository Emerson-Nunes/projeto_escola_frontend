import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradesService } from '../services/grades.service';
import { BulkGradeDto } from '../types/grade';

export const GRADES_KEY = 'grades';
export const REPORT_CARD_KEY = 'reportCard';

export function useStudentGrades(studentId: string, schoolYear?: number) {
  return useQuery({
    queryKey: [GRADES_KEY, 'student', studentId, schoolYear],
    queryFn: () => gradesService.findByStudent(studentId, schoolYear),
    enabled: !!studentId,
  });
}

export function useClassroomGrades(
  classRoomId: string,
  subjectId: string,
  bimester: number,
  schoolYear: number
) {
  return useQuery({
    queryKey: [GRADES_KEY, classRoomId, subjectId, bimester, schoolYear],
    queryFn: () => gradesService.findByClassRoom(classRoomId, subjectId, bimester, schoolYear),
    enabled: !!classRoomId && !!subjectId && !!bimester && !!schoolYear,
  });
}

export function useBulkCreateGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkGradeDto) => gradesService.bulkCreate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GRADES_KEY] });
      queryClient.invalidateQueries({ queryKey: [REPORT_CARD_KEY] });
    },
  });
}

export function useReportCard(studentId: string, schoolYear: number) {
  return useQuery({
    queryKey: [REPORT_CARD_KEY, studentId, schoolYear],
    queryFn: () => gradesService.getReportCard(studentId, schoolYear),
    enabled: !!studentId && !!schoolYear,
  });
}
