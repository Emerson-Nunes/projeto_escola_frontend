import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Mail, MapPin, User, Info, School } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';

interface SchoolConfig {
  schoolName?: string;
  phone?: string;
  email?: string;
  address?: string;
  directorName?: string;
  institutionalInfo?: string;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="mt-0.5 flex-shrink-0 text-primary">{icon}</div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { data: config, isLoading } = useQuery<SchoolConfig>({
    queryKey: ['school-config'],
    queryFn: async () => {
      const { data } = await api.get('/school-config');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const rows: Array<{ show: boolean; icon: React.ReactNode; label: string; value: string }> = [
    {
      show: !!config?.schoolName,
      icon: <School className="h-5 w-5" />,
      label: 'Nome da Escola',
      value: config?.schoolName ?? '',
    },
    {
      show: !!config?.directorName,
      icon: <User className="h-5 w-5" />,
      label: 'Diretor(a)',
      value: config?.directorName ?? '',
    },
    {
      show: !!config?.phone,
      icon: <Phone className="h-5 w-5" />,
      label: 'Telefone',
      value: config?.phone ?? '',
    },
    {
      show: !!config?.email,
      icon: <Mail className="h-5 w-5" />,
      label: 'E-mail',
      value: config?.email ?? '',
    },
    {
      show: !!config?.address,
      icon: <MapPin className="h-5 w-5" />,
      label: 'Endereço',
      value: config?.address ?? '',
    },
    {
      show: !!config?.institutionalInfo,
      icon: <Info className="h-5 w-5" />,
      label: 'Informações Institucionais',
      value: config?.institutionalInfo ?? '',
    },
  ];

  const visibleRows = rows.filter((r) => r.show);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contato com a Direção</h2>
        <p className="text-muted-foreground">Informações de contato da escola</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            {config?.schoolName ?? 'Escola'}
          </CardTitle>
          <CardDescription>Entre em contato com a equipe diretiva</CardDescription>
        </CardHeader>
        <CardContent>
          {visibleRows.length > 0 ? (
            <div className="flex flex-col">
              {visibleRows.map((row) => (
                <InfoRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-muted-foreground">
              Nenhuma informação de contato cadastrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
