"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/user-avatar";
import { Calendar, Edit, Save, User, X } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";

export function PerfilFeature() {
  const state = usePerfil();

  if (state.loading) {
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
            <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>

          {!state.isEditing ? (
            <Button onClick={state.iniciarEdicao}>
              <Edit className="h-4 w-4 mr-2 text-primary" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={state.salvar} disabled={state.saving}>
                <Save className="h-4 w-4 mr-2" />
                {state.saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={state.cancelarEdicao}>
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
                <CardDescription>Suas informações básicas de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    {state.isEditing ? (
                      <Input
                        id="nome"
                        value={state.formData.nome}
                        onChange={(e) =>
                          state.setFormData({ ...state.formData, nome: e.target.value })
                        }
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {state.userData?.nome || "Não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    {state.isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={state.formData.email}
                        onChange={(e) =>
                          state.setFormData({ ...state.formData, email: e.target.value })
                        }
                        placeholder="Digite seu e-mail"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {state.userData?.email || "Não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="especializacao">Especialização</Label>
                    {state.isEditing ? (
                      <Input
                        id="especializacao"
                        value={state.formData.especializacao}
                        onChange={(e) =>
                          state.setFormData({
                            ...state.formData,
                            especializacao: e.target.value,
                          })
                        }
                        placeholder="Digite sua especialização"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {state.userData?.especializacao || "Não informado"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center">Avatar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32">
                  {state.user?.nome && <UserAvatar name={state.user.nome} size={128} />}
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
                    {state.userData?.role || "Não definido"}
                  </Badge>
                </div>
                <div>
                  <Label>Data de Criação</Label>
                  <p className="text-sm font-medium mt-1">
                    {state.userData?.createdAt ? state.formatDate(state.userData.createdAt) : "Não informado"}
                  </p>
                </div>
                <div>
                  <Label>Última Atualização</Label>
                  <p className="text-sm font-medium mt-1">
                    {state.userData?.updatedAt ? state.formatDate(state.userData.updatedAt) : "Não informado"}
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
                    <span className="text-sm text-muted-foreground">Disciplinas</span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Alocações</span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Turmas</span>
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

