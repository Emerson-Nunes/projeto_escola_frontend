import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useClassroom, useCreateClassroom, useUpdateClassroom } from '../../hooks/useClassrooms';
import { useToast } from '../../components/ui/Toast';

const classroomSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  year: z.coerce.number().min(2000).max(2100),
  shift: z.enum(['MANHA', 'TARDE', 'NOITE']),
  grade: z.coerce.number().min(1).max(3) as z.ZodType<1 | 2 | 3>,
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

const shiftOptions = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
];

const gradeOptions = [
  { value: '1', label: '1º Ano' },
  { value: '2', label: '2º Ano' },
  { value: '3', label: '3º Ano' },
];

export default function ClassroomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();

  const { data: classroom } = useClassroom(id || '');
  const createClassroom = useCreateClassroom();
  const updateClassroom = useUpdateClassroom();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: { year: new Date().getFullYear(), shift: 'MANHA' as const, grade: 1 as 1 | 2 | 3, name: '' },
    values: classroom
      ? { name: classroom.name, year: classroom.year, shift: classroom.shift as 'MANHA' | 'TARDE' | 'NOITE', grade: classroom.grade as 1 | 2 | 3 }
      : undefined,
  });

  const onSubmit = async (data: ClassroomFormData) => {
    try {
      if (isEditing) {
        await updateClassroom.mutateAsync({ id: id!, dto: data });
        success('Turma atualizada com sucesso');
      } else {
        await createClassroom.mutateAsync(data);
        success('Turma cadastrada com sucesso');
      }
      navigate('/classrooms');
    } catch {
      error(isEditing ? 'Erro ao atualizar turma' : 'Erro ao cadastrar turma');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/classrooms')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Turma' : 'Nova Turma'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Dados da Turma</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input label="Nome da Turma *" placeholder="9º A" error={errors.name?.message} {...register('name')} />
            <Input label="Ano Letivo *" type="number" error={errors.year?.message} {...register('year')} />
            <Select
              label="Turno *"
              options={shiftOptions}
              value={watch('shift')}
              onValueChange={(v) => setValue('shift', v as 'MANHA' | 'TARDE' | 'NOITE')}
              error={errors.shift?.message}
            />
            <Select
              label="Série *"
              options={gradeOptions}
              value={String(watch('grade'))}
              onValueChange={(v) => setValue('grade', Number(v) as 1 | 2 | 3)}
              error={errors.grade?.message}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/classrooms')}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Turma'}
          </Button>
        </div>
      </form>
    </div>
  );
}
