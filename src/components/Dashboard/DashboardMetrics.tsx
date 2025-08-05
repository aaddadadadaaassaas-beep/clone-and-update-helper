import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const DashboardMetrics = () => {
  // Métricas gerais de tickets - agora visível para todos os usuários
  const { data: ticketStats } = useQuery({
    queryKey: ['dashboard-ticket-stats'],
    queryFn: async () => {
      // Get current user and role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      let query = supabase
        .from('tickets')
        .select('status, priority, created_at, closed_at, due_date');

      // Apply role-based filtering for tickets visibility
      if (profile.role === 'user') {
        query = query.eq('submitter_id', profile.id);
      } else if (profile.role === 'employee') {
        query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
      }
      // Admin and owner can see all tickets (no additional filter)

      const { data, error } = await query;

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: data.length,
        open: data.filter(t => t.status === 'open').length,
        waiting: data.filter(t => t.status === 'waiting').length,
        closed: data.filter(t => t.status === 'closed').length,
        highPriority: data.filter(t => ['high', 'urgent'].includes(t.priority)).length,
        overdue: data.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'closed').length,
        thisWeek: data.filter(t => new Date(t.created_at) >= weekAgo).length,
        closedThisWeek: data.filter(t => t.closed_at && new Date(t.closed_at) >= weekAgo).length,
      };

      return stats;
    },
  });

  // Tickets por categoria
  const { data: categoryData } = useQuery({
    queryKey: ['dashboard-category-stats'],
    queryFn: async () => {
      // Get current user and role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      let query = supabase
        .from('tickets')
        .select(`
          status,
          category:categories(name, color)
        `);

      // Apply role-based filtering
      if (profile.role === 'user') {
        query = query.eq('submitter_id', profile.id);
      } else if (profile.role === 'employee') {
        query = query.or(`submitter_id.eq.${profile.id},assignee_id.eq.${profile.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const categoryStats = data.reduce((acc: any, ticket) => {
        const categoryName = ticket.category?.name || 'Sem categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = { open: 0, waiting: 0, closed: 0, total: 0 };
        }
        acc[categoryName][ticket.status]++;
        acc[categoryName].total++;
        return acc;
      }, {});

      return Object.entries(categoryStats).map(([name, stats]: [string, any]) => ({
        name,
        ...stats,
      }));
    },
  });

  // Tickets por mês (últimos 6 meses)
  const { data: monthlyData } = useQuery({
    queryKey: ['dashboard-monthly-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('created_at, closed_at')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      if (error) throw error;

      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const created = data.filter(t => {
          const ticketDate = new Date(t.created_at);
          return ticketDate.getMonth() === date.getMonth() && ticketDate.getFullYear() === date.getFullYear();
        }).length;

        const closed = data.filter(t => {
          if (!t.closed_at) return false;
          const closedDate = new Date(t.closed_at);
          return closedDate.getMonth() === date.getMonth() && closedDate.getFullYear() === date.getFullYear();
        }).length;

        months.push({ month: monthName, created, closed });
      }

      return months;
    },
  });

  // Performance metrics
  const { data: performance } = useQuery({
    queryKey: ['dashboard-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('created_at, closed_at, status')
        .not('closed_at', 'is', null);

      if (error) throw error;

      if (data.length === 0) {
        return { avgResolutionTime: 0, totalResolved: 0 };
      }

      const resolutionTimes = data.map(ticket => {
        const created = new Date(ticket.created_at);
        const closed = new Date(ticket.closed_at);
        return (closed.getTime() - created.getTime()) / (1000 * 60 * 60); // em horas
      });

      const avgResolutionTime = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;

      return {
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        totalResolved: data.length,
      };
    },
  });

  const totalTickets = (ticketStats?.open || 0) + (ticketStats?.waiting || 0) + (ticketStats?.closed || 0);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats?.thisWeek || 0} novos esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ticketStats?.open || 0}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats?.highPriority || 0} alta prioridade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Vencidos</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{ticketStats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Precisam atenção urgente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performance?.avgResolutionTime || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              {ticketStats?.closedThisWeek || 0} resolvidos esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Abertos</span>
                <span className="text-red-600">{ticketStats?.open || 0}</span>
              </div>
              <Progress 
                value={totalTickets > 0 ? ((ticketStats?.open || 0) / totalTickets) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Aguardando</span>
                <span className="text-yellow-600">{ticketStats?.waiting || 0}</span>
              </div>
              <Progress 
                value={totalTickets > 0 ? ((ticketStats?.waiting || 0) / totalTickets) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fechados</span>
                <span className="text-green-600">{ticketStats?.closed || 0}</span>
              </div>
              <Progress 
                value={totalTickets > 0 ? ((ticketStats?.closed || 0) / totalTickets) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {performance?.avgResolutionTime || 0}h
              </div>
              <p className="text-sm text-muted-foreground">Tempo médio de resolução</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{performance?.totalResolved || 0}</div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{ticketStats?.overdue || 0}</div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Categoria */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData?.slice(0, 5).map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="font-medium">{category.total}</span>
                  </div>
                  <div className="flex space-x-1">
                    <div 
                      className="bg-red-500 h-2 rounded-l"
                      style={{ width: `${(category.open / category.total) * 100}%` }}
                    />
                    <div 
                      className="bg-yellow-500 h-2"
                      style={{ width: `${(category.waiting / category.total) * 100}%` }}
                    />
                    <div 
                      className="bg-green-500 h-2 rounded-r"
                      style={{ width: `${(category.closed / category.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Abertos: {category.open}</span>
                    <span>Aguardando: {category.waiting}</span>
                    <span>Fechados: {category.closed}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;