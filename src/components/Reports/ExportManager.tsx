import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  Upload, 
  FileJson, 
  FileText, 
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

const ExportManager = () => {
  const [exportFormat, setExportFormat] = useState("json");
  const [dateRange, setDateRange] = useState("all");
  const [includeComments, setIncludeComments] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [bulkOperation, setBulkOperation] = useState("");
  const [ticketIds, setTicketIds] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const mockExportHistory = [
    {
      id: "1",
      type: "export",
      format: "JSON",
      status: "completed",
      records: 1247,
      createdAt: "2024-01-15T14:30:00Z",
      fileSize: "2.4 MB",
      downloadUrl: "#"
    },
    {
      id: "2",
      type: "bulk_delete",
      format: "Operação em Lote",
      status: "completed",
      records: 25,
      createdAt: "2024-01-15T13:15:00Z",
      fileSize: "-",
      downloadUrl: null
    },
    {
      id: "3",
      type: "export",
      format: "CSV",
      status: "failed",
      records: 0,
      createdAt: "2024-01-15T12:00:00Z",
      fileSize: "-",
      downloadUrl: null
    },
    {
      id: "4",
      type: "export",
      format: "JSON",
      status: "processing",
      records: 3422,
      createdAt: "2024-01-15T11:45:00Z",
      fileSize: "-",
      downloadUrl: null
    }
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: { label: "Concluído", variant: "default" as const, icon: CheckCircle },
      processing: { label: "Processando", variant: "secondary" as const, icon: Clock },
      failed: { label: "Falhou", variant: "destructive" as const, icon: X }
    };
    
    const config = configs[status as keyof typeof configs] || configs.processing;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "export":
        return <Download className="h-4 w-4" />;
      case "import":
        return <Upload className="h-4 w-4" />;
      case "bulk_delete":
      case "bulk_update":
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simular progresso de exportação
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleBulkOperation = () => {
    if (!bulkOperation) {
      alert("Selecione uma operação em lote");
      return;
    }
    
    if (bulkOperation === "delete_tickets" && !ticketIds.trim()) {
      alert("Informe os IDs dos tickets para exclusão");
      return;
    }
    
    const confirmMessage = bulkOperation === "delete_tickets" 
      ? "Tem certeza que deseja excluir os tickets informados?" 
      : "Tem certeza que deseja executar esta operação?";
      
    if (confirm(confirmMessage)) {
      console.log("Executando operação:", bulkOperation, "IDs:", ticketIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exportação de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Tickets
          </CardTitle>
          <CardDescription>
            Exporte dados de tickets em diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato de Exportação</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON - Dados completos
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV - Planilha
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="comments"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="comments" className="text-sm">
                Incluir comentários
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="attachments"
                checked={includeAttachments}
                onChange={(e) => setIncludeAttachments(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="attachments" className="text-sm">
                Incluir anexos (referências)
              </label>
            </div>
          </div>
          
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exportando dados...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full md:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Iniciar Exportação"}
          </Button>
        </CardContent>
      </Card>

      {/* Operações em Lote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Operações em Lote
          </CardTitle>
          <CardDescription>
            Execute operações em múltiplos tickets simultaneamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Operação</label>
            <Select value={bulkOperation} onValueChange={setBulkOperation}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete_tickets">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    Excluir tickets por ID
                  </div>
                </SelectItem>
                <SelectItem value="update_status">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Atualizar status em massa
                  </div>
                </SelectItem>
                <SelectItem value="delete_users">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Excluir usuários associados
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {bulkOperation === "delete_tickets" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">IDs dos Tickets</label>
              <Textarea
                placeholder="Digite os IDs dos tickets separados por vírgula (ex: 1, 2, 3, 4)"
                value={ticketIds}
                onChange={(e) => setTicketIds(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Esta operação é irreversível. Todos os dados relacionados aos tickets serão perdidos.
              </p>
            </div>
          )}
          
          {bulkOperation === "delete_users" && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Aviso Importante</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Administradores não podem ser excluídos em operações em lote. 
                    Apenas usuários com perfil "employee" serão removidos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleBulkOperation}
            disabled={!bulkOperation}
            variant={bulkOperation?.includes("delete") ? "destructive" : "default"}
            className="w-full md:w-auto"
          >
            <Archive className="h-4 w-4 mr-2" />
            Executar Operação
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Operações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Operações</CardTitle>
          <CardDescription>
            Acompanhe o status das exportações e operações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExportHistory.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(operation.type)}
                      <span className="font-medium">{operation.format}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(operation.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {operation.records.toLocaleString()} registros
                    </Badge>
                  </TableCell>
                  <TableCell>{operation.fileSize}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(operation.createdAt).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {operation.downloadUrl && operation.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {operation.status === "processing" && (
                      <span className="text-xs text-muted-foreground">
                        Processando...
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportManager;