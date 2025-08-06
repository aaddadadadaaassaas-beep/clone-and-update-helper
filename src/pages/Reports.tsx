import { useState } from 'react';
import Layout from "@/components/Layout/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JsonExport from '@/components/Reports/JsonExport';
import BatchOperations from '@/components/Admin/BatchOperations';
import { FileText, Download, Zap, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

const Reports = () => {
  const [showJsonExport, setShowJsonExport] = useState(false);
  const { generatePerformanceReport, generateUsersReport, generateCategoriesReport } = useReports();

  return (
    <Layout title="Relatórios" subtitle="Gerencie relatórios e operações avançadas">
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportação</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Operações em Lote</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Relatório de Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa de resolução no prazo
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generatePerformanceReport.mutate({ format: 'json' })}
                    disabled={generatePerformanceReport.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generatePerformanceReport.mutate({ format: 'excel' })}
                    disabled={generatePerformanceReport.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Relatório de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">
                  Usuários ativos no sistema
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateUsersReport.mutate({ format: 'json' })}
                    disabled={generateUsersReport.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateUsersReport.mutate({ format: 'excel' })}
                    disabled={generateUsersReport.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Relatório de Categorias
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Categorias configuradas
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateCategoriesReport.mutate({ format: 'json' })}
                    disabled={generateCategoriesReport.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateCategoriesReport.mutate({ format: 'excel' })}
                    disabled={generateCategoriesReport.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Dados JSON
                </CardTitle>
                <CardDescription>
                  Exporte dados completos de tickets em formato JSON para análise ou backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowJsonExport(true)}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar Tickets JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados Incluídos na Exportação</CardTitle>
                <CardDescription>
                  A exportação JSON inclui todas as informações relevantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Informações completas dos tickets
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Histórico de alterações
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Comentários públicos e privados
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Referências de anexos
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Dados dos usuários envolvidos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <JsonExport
            open={showJsonExport}
            onOpenChange={setShowJsonExport}
          />
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <BatchOperations />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;