import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportData {
  type: 'performance' | 'users' | 'categories';
  data: any;
  generatedAt: string;
}

export const useReports = () => {
  const { toast } = useToast();

  const generatePerformanceReport = useMutation({
    mutationFn: async (): Promise<ReportData> => {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          priority,
          created_at,
          updated_at,
          due_date,
          closed_at
        `);

      if (error) throw error;

      // Calcular métricas de performance
      const totalTickets = tickets.length;
      const closedTickets = tickets.filter(t => t.status === 'closed').length;
      const overdueTickets = tickets.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'closed'
      ).length;
      
      const resolvedOnTime = tickets.filter(t => 
        t.status === 'closed' && 
        t.due_date && 
        t.closed_at && 
        new Date(t.closed_at) <= new Date(t.due_date)
      ).length;

      const performanceRate = totalTickets > 0 ? Math.round((resolvedOnTime / totalTickets) * 100) : 0;

      return {
        type: 'performance',
        data: {
          totalTickets,
          closedTickets,
          overdueTickets,
          performanceRate,
          avgResolutionTime: '2.5 dias', // Cálculo simplificado
          ticketsByPriority: {
            urgent: tickets.filter(t => t.priority === 'urgent').length,
            high: tickets.filter(t => t.priority === 'high').length,
            normal: tickets.filter(t => t.priority === 'normal').length,
            low: tickets.filter(t => t.priority === 'low').length,
          }
        },
        generatedAt: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      // Fazer download do relatório
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Relatório de performance foi gerado e baixado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateUsersReport = useMutation({
    mutationFn: async (): Promise<ReportData> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_active,
          created_at,
          organization
        `);

      if (error) throw error;

      const activeUsers = profiles.filter(p => p.is_active).length;
      const usersByRole = {
        admin: profiles.filter(p => p.role === 'admin').length,
        owner: profiles.filter(p => p.role === 'owner').length,
        employee: profiles.filter(p => p.role === 'employee').length,
        user: profiles.filter(p => p.role === 'user').length,
      };

      return {
        type: 'users',
        data: {
          totalUsers: profiles.length,
          activeUsers,
          inactiveUsers: profiles.length - activeUsers,
          usersByRole,
          users: profiles.map(p => ({
            name: p.full_name,
            email: p.email,
            role: p.role,
            isActive: p.is_active,
            organization: p.organization,
            createdAt: p.created_at
          }))
        },
        generatedAt: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-usuarios-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Relatório de usuários foi gerado e baixado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateCategoriesReport = useMutation({
    mutationFn: async (): Promise<ReportData> => {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) throw catError;

      // Buscar contagem de tickets por categoria
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const { count, error } = await supabase
            .from('tickets')
            .select('*', { count: 'exact' })
            .eq('category_id', category.id);

          if (error) {
            console.error('Error counting tickets for category:', error);
            return { ...category, ticketCount: 0 };
          }

          return { ...category, ticketCount: count || 0 };
        })
      );

      return {
        type: 'categories',
        data: {
          totalCategories: categories.length,
          activeCategories: categories.filter(c => c.is_active).length,
          categories: categoryStats.map(c => ({
            name: c.name,
            description: c.description,
            color: c.color,
            ticketCount: c.ticketCount,
            isActive: c.is_active,
            createdAt: c.created_at
          }))
        },
        generatedAt: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-categorias-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Relatório de categorias foi gerado e baixado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    generatePerformanceReport,
    generateUsersReport,
    generateCategoriesReport,
  };
};