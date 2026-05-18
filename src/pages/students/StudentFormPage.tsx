import React, { useState } from 'react';
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
import { isValidCPF, formatCPFInput } from '../../utils/cpf';
import { formatPhoneInput, unformatPhone } from '../../utils/phone';

function isAtLeast10(dateStr: string): boolean {
  const birth = new Date(dateStr);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  return age > 10 || (age === 10 && (m > 0 || (m === 0 && today.getDate() >= birth.getDate())));
}

const studentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional().or(z.literal('')),
  cpf: z.string().refine((v) => isValidCPF(v), 'CPF inválido — verifique os dígitos'),
  birthDate: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((v) => isAtLeast10(v), 'Aluno deve ter ao menos 10 anos de idade'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().optional(),
  classRoomId: z.string().min(1, 'Turma é obrigatória'),
  guardianId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();
  const [cpfDisplay, setCpfDisplay] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');

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
          birthDate: student.birthDate?.split('T')[0] ?? '',
          phone: student.phone,
          address: student.address || '',
          classRoomId: student.classRoomId,
          guardianId: student.guardianId || '',
        }
      : undefined,
  });

  React.useEffect(() => {
    if (student?.cpf) setCpfDisplay(formatCPFInput(student.cpf));
    if (student?.phone) setPhoneDisplay(formatPhoneInput(student.phone));
  }, [student]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFInput(e.target.value);
    setCpfDisplay(formatted);
    setValue('cpf', formatted.replace(/\D/g, ''), { shouldValidate: true });
  };

  const classroomOptions = classroomsData?.data?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const onSubmit = async (data: StudentFormData) => {
    try {
      const payload = { ...data, cpf: data.cpf.replace(/\D/g, '') };
      if (isEditing) {
        const { password, ...rest } = payload;
        await updateStudent.mutateAsync({
          id: id!,
          dto: password ? payload : rest,
        });
        success('Aluno atualizado com sucesso');
      } else {
        await createStudent.mutateAsync({
          ...payload,
          password: payload.password || '',
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
          <Card>
            <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="Nome completo *" placeholder="João da Silva" error={errors.name?.message} {...register('name')} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">CPF *</label>
                <input
                  type="text"
                  value={cpfDisplay}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.cpf ? 'border-destructive' : 'border-border'}`}
                />
                {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
              </div>

              <Input label="Data de Nascimento *" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
              <Input
                label="Telefone *"
                value={phoneDisplay}
                onChange={(e) => {
                  const formatted = formatPhoneInput(e.target.value);
                  setPhoneDisplay(formatted);
                  setValue('phone', unformatPhone(formatted));
                }}
                placeholder="(00) 00000-0000"
                error={errors.phone?.message}
              />
              <Input label="Endereço" placeholder="Rua, número, bairro" error={errors.address?.message} {...register('address')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Acesso e Turma</CardTitle></CardHeader>
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
              <Select
                label="Turma *"
                options={classroomOptions}
                value={watch('classRoomId')}
                onValueChange={(v) => setValue('classRoomId', v)}
                error={errors.classRoomId?.message}
                placeholder="Selecione a turma"
              />
              {!isEditing && (
                <p className="text-xs text-muted-foreground">
                  A matrícula será gerada automaticamente com base no ano letivo atual.
                </p>
              )}
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
