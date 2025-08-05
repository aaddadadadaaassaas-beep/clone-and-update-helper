import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  Clock,
  Users,
  Mail,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
}

const AutomationRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutoRule[]>([
    {
      id: "1",
      name: "Auto-assign alta prioridade",
      trigger: "ticket_created",
      condition: "priority = high OR priority = urgent",
      action: "assign_to_admin",
      isActive: true
    },
    {
      id: "2", 
      name: "Escalação automática",
      trigger: "ticket_idle",
      condition: "status = open AND idle_time > 24h",
      action: "notify_manager",
      isActive: false
    }
  ]);

  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "",
    condition: "",
    action: "",
    isActive: true
  });

  const [isAddingRule, setIsAddingRule] = useState(false);

  const triggerOptions = [
    { value: "ticket_created", label: "Ticket criado" },
    { value: "ticket_updated", label: "Ticket atualizado" },
    { value: "comment_added", label: "Comentário adicionado" },
    { value: "ticket_idle", label: "Ticket inativo" },
    { value: "due_date_approaching", label: "Data de vencimento próxima" }
  ];

  const actionOptions = [
    { value: "assign_to_admin", label: "Atribuir ao administrador" },
    { value: "assign_to_user", label: "Atribuir a usuário específico" },
    { value: "change_priority", label: "Alterar prioridade" },
    { value: "change_status", label: "Alterar status" },
    { value: "send_notification", label: "Enviar notificação" },
    { value: "notify_manager", label: "Notificar gerente" },
    { value: "add_tag", label: "Adicionar tag" },
    { value: "escalate", label: "Escalar ticket" }
  ];

  const handleAddRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const rule: AutoRule = {
      id: Date.now().toString(),
      ...newRule
    };

    setRules([...rules, rule]);
    setNewRule({
      name: "",
      trigger: "",
      condition: "",
      action: "",
      isActive: true
    });
    setIsAddingRule(false);

    toast({
      title: "Regra criada",
      description: "A regra de automação foi criada com sucesso.",
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Regra excluída",
      description: "A regra de automação foi removida.",
    });
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'ticket_created': return <Plus className="h-4 w-4" />;
      case 'ticket_idle': return <Clock className="h-4 w-4" />;
      case 'comment_added': return <Mail className="h-4 w-4" />;
      case 'due_date_approaching': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Regras de Automação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Existing Rules */}
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTriggerIcon(rule.trigger)}
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Gatilho</Label>
                    <p>{triggerOptions.find(t => t.value === rule.trigger)?.label}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Condição</Label>
                    <p className="font-mono bg-muted px-2 py-1 rounded text-xs">
                      {rule.condition || "Nenhuma"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ação</Label>
                    <p>{actionOptions.find(a => a.value === rule.action)?.label}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Rule */}
            {isAddingRule ? (
              <div className="border-2 border-dashed rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Nova Regra de Automação</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Nome da Regra *</Label>
                    <Input
                      id="rule-name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="Ex: Auto-assign tickets críticos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-trigger">Gatilho *</Label>
                    <Select
                      value={newRule.trigger}
                      onValueChange={(value) => setNewRule({...newRule, trigger: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gatilho" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-condition">Condição</Label>
                    <Input
                      id="rule-condition"
                      value={newRule.condition}
                      onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                      placeholder="Ex: priority = high"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-action">Ação *</Label>
                    <Select
                      value={newRule.action}
                      onValueChange={(value) => setNewRule({...newRule, action: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ação" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleAddRule}>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Regra
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingRule(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsAddingRule(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Regra de Automação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SLA Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Configurações de SLA</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sla-response">Tempo de Resposta (horas)</Label>
              <Input
                id="sla-response"
                type="number"
                defaultValue="4"
                min="1"
                max="72"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sla-resolution">Tempo de Resolução (horas)</Label>
              <Input
                id="sla-resolution"
                type="number"
                defaultValue="24"
                min="1"
                max="168"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sla-escalation">Escalação Automática (horas)</Label>
              <Input
                id="sla-escalation"
                type="number"
                defaultValue="12"
                min="1"
                max="48"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sla-priority">SLA por Prioridade</Label>
              <Select defaultValue="enabled">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Habilitado</SelectItem>
                  <SelectItem value="disabled">Desabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Monitoramento de SLA</Label>
              <p className="text-sm text-muted-foreground">
                Ativar alertas automáticos para violações de SLA
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações SLA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationRules;
