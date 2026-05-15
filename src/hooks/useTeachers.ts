import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersService } from '../services/teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from '../types/teacher';
import { PaginationParams } from '../types/pagination';

export const TEACHERS_KEY = 'teachers';

export function useTeachers(params?: PaginationParams) {
  return useQuery({
    queryKey: [TEACHERS_KEY, params],
    queryFn: () => teachersService.findAll(params),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: [TEACHERS_KEY, id],
    queryFn: () => teachersService.findById(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTeacherDto) => teachersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_KEY] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTeacherDto }) =>
      teachersService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_KEY] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEACHERS_KEY] });
    },
  });
}
