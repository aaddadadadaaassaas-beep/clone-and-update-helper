import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreHorizontal, Tag, Search } from "lucide-react";

const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  });

  const mockCategories = [
    {
      id: "1",
      name: "Hardware",
      description: "Problemas relacionados a equipamentos físicos",
      color: "#ef4444",
      ticketCount: 45,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "2",
      name: "Software",
      description: "Questões de aplicativos e sistemas operacionais",
      color: "#3b82f6",
      ticketCount: 32,
      createdAt: "2024-01-02T00:00:00Z"
    },
    {
      id: "3",
      name: "Rede",
      description: "Conectividade e problemas de internet",
      color: "#10b981",
      ticketCount: 18,
      createdAt: "2024-01-03T00:00:00Z"
    },
    {
      id: "4",
      name: "Acesso",
      description: "Permissões e autenticação de usuários",
      color: "#f59e0b",
      ticketCount: 12,
      createdAt: "2024-01-04T00:00:00Z"
    }
  ];

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Atualizar categoria existente
      console.log("Atualizando categoria:", formData);
    } else {
      // Criar nova categoria
      console.log("Criando categoria:", formData);
    }
    setShowDialog(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#3b82f6" });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowDialog(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      console.log("Excluindo categoria:", categoryId);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#3b82f6" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gerenciar Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Organize tickets por categorias para melhor classificação
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? "Atualize as informações da categoria"
                  : "Crie uma nova categoria para organizar tickets"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Categoria</label>
                <Input
                  placeholder="Ex: Hardware, Software..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descreva o tipo de tickets desta categoria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded border"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <Badge variant="secondary">{filteredCategories.length} categorias</Badge>
          </CardTitle>
          <CardDescription>
            Busque por nome ou descrição da categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Categorias */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <Badge 
                          variant="outline" 
                          className="text-xs mt-1"
                          style={{ 
                            borderColor: category.color,
                            color: category.color 
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {category.name}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.ticketCount} tickets
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default CategoryManager;