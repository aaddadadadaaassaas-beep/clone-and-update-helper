import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  likes: number;
  dislikes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const KnowledgeBase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [articles] = useState<KBArticle[]>([
    {
      id: "1",
      title: "Como resetar sua senha",
      content: "Instruções detalhadas para resetar a senha do sistema...",
      category: "Autenticação",
      views: 1250,
      likes: 45,
      dislikes: 2,
      isPublished: true,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: "2",
      title: "Configuração de notificações por email",
      content: "Como configurar e personalizar suas notificações...",
      category: "Configurações",
      views: 890,
      likes: 38,
      dislikes: 1,
      isPublished: true,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18"
    },
    {
      id: "3",
      title: "Guia de criação de tickets",
      content: "Passo a passo para criar tickets eficientes...",
      category: "Tickets",
      views: 2100,
      likes: 78,
      dislikes: 5,
      isPublished: true,
      createdAt: "2024-01-05",
      updatedAt: "2024-01-22"
    }
  ]);

  const categories = ["Autenticação", "Configurações", "Tickets", "Relatórios"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularArticles = articles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const topRatedArticles = articles
    .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Knowledge Base Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Base de Conhecimento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Artigos</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Artigo
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{article.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.content}
                          </p>
                        </div>
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{article.dislikes}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <TrendingUp className="h-4 w-4" />
                <span>Mais Visualizados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <div key={article.id} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.views} visualizações</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Rated */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Star className="h-4 w-4" />
                <span>Melhor Avaliados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topRatedArticles.map((article) => (
                  <div key={article.id} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{article.likes}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <ThumbsDown className="h-3 w-3" />
                          <span>{article.dislikes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Users className="h-4 w-4" />
                <span>Por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => {
                  const count = articles.filter(a => a.category === category).length;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;