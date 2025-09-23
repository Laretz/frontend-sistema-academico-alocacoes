"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Importação do novo componente UserAvatar
import UserAvatar from "@/components/ui/user-avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "@/services/users";
import { User as UserType } from "@/types/auth";
import { useAuthStore } from "@/store/auth";
// A biblioteca `animal-avatar-generator` não será mais usada, pode removê-la se quiser.

interface ProfileFormData {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  especializacao?: string;
}

export default function PerfilPage() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    especializacao: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await userService.getById(user.id);
        setUserData(response);
        setFormData({
          nome: response.nome || "",
          email: response.email || "",
          telefone: response.telefone || "",
          endereco: response.endereco || "",
          especializacao: response.especializacao || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (user?.id) {
        await userService.update(user.id, formData);
        await loadUserData();
        setIsEditing(false);
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        nome: userData.nome || "",
        email: userData.email || "",
        telefone: userData.telefone || "",
        endereco: userData.endereco || "",
        especializacao: userData.especializacao || "",
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Suas informações básicas de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {userData?.nome || "Não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Digite seu e-mail"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {userData?.email || "Não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    {isEditing ? (
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({ ...formData, telefone: e.target.value })
                        }
                        placeholder="Digite seu telefone"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {userData?.telefone || "Não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="especializacao">Especialização</Label>
                    {isEditing ? (
                      <Input
                        id="especializacao"
                        value={formData.especializacao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            especializacao: e.target.value,
                          })
                        }
                        placeholder="Digite sua especialização"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {userData?.especializacao || "Não informado"}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  {isEditing ? (
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      placeholder="Digite seu endereço"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {userData?.endereco || "Não informado"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  Avatar
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32">
                  {user?.nome && <UserAvatar name={user.nome} size={128} />}
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Usuário</Label>
                  <Badge variant="secondary" className="mt-1">
                    {userData?.tipo || "Não definido"}
                  </Badge>
                </div>
                <div>
                  <Label>Data de Criação</Label>
                  <p className="text-sm font-medium mt-1">
                    {userData?.createdAt
                      ? formatDate(userData.createdAt)
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <Label>Última Atualização</Label>
                  <p className="text-sm font-medium mt-1">
                    {userData?.updatedAt
                      ? formatDate(userData.updatedAt)
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="default" className="mt-1">
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Disciplinas
                    </span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Alocações
                    </span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Turmas
                    </span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
