import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsService } from '../services/classrooms.service';
import { CreateClassRoomDto, UpdateClassRoomDto } from '../types/classroom';
import { PaginationParams } from '../types/pagination';

export const CLASSROOMS_KEY = 'classrooms';

export function useClassrooms(params?: PaginationParams) {
  return useQuery({
    queryKey: [CLASSROOMS_KEY, params],
    queryFn: () => classroomsService.findAll(params),
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: [CLASSROOMS_KEY, id],
    queryFn: () => classroomsService.findById(id),
    enabled: !!id,
  });
}

export function useClassroomStudents(id: string, search?: string) {
  return useQuery({
    queryKey: [CLASSROOMS_KEY, id, 'students', search],
    queryFn: () => classroomsService.findStudents(id, search),
    enabled: !!id,
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClassRoomDto) => classroomsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSROOMS_KEY] });
    },
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClassRoomDto }) =>
      classroomsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSROOMS_KEY] });
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classroomsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLASSROOMS_KEY] });
    },
  });
}
