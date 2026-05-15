import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsService } from '../services/students.service';
import { CreateStudentDto, UpdateStudentDto } from '../types/student';
import { PaginationParams } from '../types/pagination';

interface StudentFilters extends PaginationParams {
  classRoomId?: string;
  isActive?: boolean;
}

export const STUDENTS_KEY = 'students';

export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: [STUDENTS_KEY, filters],
    queryFn: () => studentsService.findAll(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: [STUDENTS_KEY, id],
    queryFn: () => studentsService.findById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudentDto) => studentsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      studentsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}
