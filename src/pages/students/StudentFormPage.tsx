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
import { useStudent, useCreateStudent, useUpdateStudent } from '../../hooks/useStudents';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useToast } from '../../components/ui/Toast';

const studentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional().or(z.literal('')),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço é obrigatório'),
  enrollmentNumber: z.string().min(1, 'Número de matrícula é obrigatório'),
  classRoomId: z.string().min(1, 'Turma é obrigatória'),
  guardianId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();

  const { data: student } = useStudent(id || '');
  const { data: classroomsData } = useClassrooms({ limit: 100 });
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    values: student
      ? {
          name: student.name,
          email: '',
          password: '',
          cpf: student.cpf,
          birthDate: student.birthDate.split('T')[0],
          phone: student.phone,
          address: student.address,
          enrollmentNumber: student.enrollmentNumber,
          classRoomId: student.classRoomId,
          guardianId: student.guardianId || '',
        }
      : undefined,
  });

  const classroomOptions = classroomsData?.data?.map((c) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (isEditing) {
        const { password, ...rest } = data;
        await updateStudent.mutateAsync({
          id: id!,
          dto: password ? data : rest,
        });
        success('Aluno atualizado com sucesso');
      } else {
        await createStudent.mutateAsync({
          ...data,
          password: data.password || '',
        });
        success('Aluno cadastrado com sucesso');
      }
      navigate('/students');
    } catch {
      error(isEditing ? 'Erro ao atualizar aluno' : 'Erro ao cadastrar aluno');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Aluno' : 'Novo Aluno'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do aluno' : 'Preencha os dados para cadastrar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal data */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nome completo *"
                placeholder="João da Silva"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="CPF *"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...register('cpf')}
              />
              <Input
                label="Data de Nascimento *"
                type="date"
                error={errors.birthDate?.message}
                {...register('birthDate')}
              />
              <Input
                label="Telefone *"
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Endereço *"
                placeholder="Rua, número, bairro, cidade"
                error={errors.address?.message}
                {...register('address')}
              />
            </CardContent>
          </Card>

          {/* Access and enrollment */}
          <Card>
            <CardHeader>
              <CardTitle>Acesso e Matrícula</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label={isEditing ? 'Email' : 'Email *'}
                type="email"
                placeholder="aluno@escola.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={isEditing ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Número de Matrícula *"
                placeholder="2024001"
                error={errors.enrollmentNumber?.message}
                {...register('enrollmentNumber')}
              />
              <Select
                label="Turma *"
                options={classroomOptions}
                value={watch('classRoomId')}
                onValueChange={(v) => setValue('classRoomId', v)}
                error={errors.classRoomId?.message}
                placeholder="Selecione a turma"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/students')}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno'}
          </Button>
        </div>
      </form>
    </div>
  );
}
