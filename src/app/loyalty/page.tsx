"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Gift, 
  Star, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Award,
  Target,
  Crown,
  Calendar,
  CreditCard,
  Percent
} from 'lucide-react'

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  pointsPerPurchase: number
  pointsValue: number
  minOrderValue: number
  isActive: boolean
  membersCount: number
  totalPoints: number
  rewardsRedeemed: number
  createdAt: string
}

interface LoyaltyTier {
  id: string
  name: string
  description: string
  minPoints: number
  benefits: string[]
  color: string
  membersCount: number
}

interface LoyaltyReward {
  id: string
  name: string
  description: string
  pointsRequired: number
  type: 'discount' | 'product' | 'free_delivery'
  value: number
  isActive: boolean
  redemptions: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  points: number
  tier: string
  totalSpent: number
  ordersCount: number
  lastVisit: string
  memberSince: string
}

export default function LoyaltyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mockados
      setPrograms([
        {
          id: '1',
          name: 'Salgado Club',
          description: 'Acumule pontos a cada compra e ganhe recompensas exclusivas',
          pointsPerPurchase: 1,
          pointsValue: 0.01,
          minOrderValue: 20,
          isActive: true,
          membersCount: 1247,
          totalPoints: 45678,
          rewardsRedeemed: 892,
          createdAt: '2024-01-01'
        }
      ])

      setTiers([
        {
          id: '1',
          name: 'Bronze',
          description: 'Membro iniciante',
          minPoints: 0,
          benefits: ['1 ponto por R$1 gasto', 'Ofertas exclusivas'],
          color: '#CD7F32',
          membersCount: 856
        },
        {
          id: '2',
          name: 'Prata',
          description: 'Membro dedicado',
          minPoints: 500,
          benefits: ['1.2x pontos', 'Brinde de aniversário', 'Delivery grátis em pedidos acima de R$50'],
          color: '#C0C0C0',
          membersCount: 312
        },
        {
          id: '3',
          name: 'Ouro',
          description: 'Membro VIP',
          minPoints: 1500,
          benefits: ['1.5x pontos', 'Brinde exclusivo', 'Delivery grátis sempre', 'Atendimento prioritário'],
          color: '#FFD700',
          membersCount: 79
        }
      ])

      setRewards([
        {
          id: '1',
          name: 'Desconto de 10%',
          description: '10% de desconto em seu próximo pedido',
          pointsRequired: 100,
          type: 'discount',
          value: 10,
          isActive: true,
          redemptions: 234
        },
        {
          id: '2',
          name: 'Salgado Grátis',
          description: 'Escolha qualquer salgado do cardápio',
          pointsRequired: 200,
          type: 'product',
          value: 0,
          isActive: true,
          redemptions: 156
        },
        {
          id: '3',
          name: 'Delivery Grátis',
          description: 'Delivery grátis em qualquer pedido',
          pointsRequired: 150,
          type: 'free_delivery',
          value: 0,
          isActive: true,
          redemptions: 189
        },
        {
          id: '4',
          name: 'Desconto de 20%',
          description: '20% de desconto em pedidos acima de R$50',
          pointsRequired: 300,
          type: 'discount',
          value: 20,
          isActive: true,
          redemptions: 98
        }
      ])

      setCustomers([
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 9999-1234',
          points: 1250,
          tier: 'Prata',
          totalSpent: 1250,
          ordersCount: 45,
          lastVisit: '2024-01-15',
          memberSince: '2023-06-01'
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 9999-5678',
          points: 2100,
          tier: 'Ouro',
          totalSpent: 2100,
          ordersCount: 78,
          lastVisit: '2024-01-14',
          memberSince: '2023-03-15'
        },
        {
          id: '3',
          name: 'Pedro Oliveira',
          email: 'pedro@email.com',
          phone: '(11) 9999-9012',
          points: 350,
          tier: 'Bronze',
          totalSpent: 350,
          ordersCount: 12,
          lastVisit: '2024-01-13',
          memberSince: '2023-11-20'
        }
      ])

      setIsLoading(false)
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const program = programs[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programa de Fidelidade</h1>
          <p className="text-muted-foreground">
            Gerencie programas de fidelidade e recompense seus clientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Programa
          </Button>
          <Button variant="outline">
            <Award className="mr-2 h-4 w-4" />
            Nova Recompensa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program?.membersCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program?.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas Resgatadas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program?.rewardsRedeemed}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resgate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              Eficiência do programa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tiers">Níveis</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  {program?.name}
                </CardTitle>
                <CardDescription>{program?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pontos por R$1</Label>
                    <div className="text-2xl font-bold">{program?.pointsPerPurchase}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Valor do Ponto</Label>
                    <div className="text-2xl font-bold">R$ {program?.pointsValue.toFixed(3)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pedido Mínimo</Label>
                    <div className="text-2xl font-bold">R$ {program?.minOrderValue}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={program?.isActive ? "default" : "secondary"}>
                      {program?.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Níveis</CardTitle>
                <CardDescription>Como os membros estão distribuídos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <div>
                          <div className="font-medium">{tier.name}</div>
                          <div className="text-sm text-muted-foreground">{tier.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{tier.membersCount}</div>
                        <div className="text-sm text-muted-foreground">membros</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recompensas Populares</CardTitle>
              <CardDescription>As recompensas mais resgatadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {rewards.slice(0, 4).map((reward) => (
                  <div key={reward.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {reward.type === 'discount' && <Percent className="h-4 w-4" />}
                        {reward.type === 'product' && <Gift className="h-4 w-4" />}
                        {reward.type === 'free_delivery' && <CreditCard className="h-4 w-4" />}
                        <span className="font-medium text-sm">{reward.name}</span>
                      </div>
                      <Badge variant="outline">{reward.pointsRequired} pts</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{reward.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {reward.redemptions} resgates
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Fidelidade</CardTitle>
              <CardDescription>Configure os níveis e benefícios do programa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: tier.color }}
                        >
                          {tier.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{tier.name}</h3>
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{tier.membersCount} membros</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Mínimo de pontos: </span>
                        {tier.minPoints} pontos
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Benefícios: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tier.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Nível
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recompensas Disponíveis</CardTitle>
              <CardDescription>Gerencie as recompensas do programa de fidelidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map((reward) => (
                  <div key={reward.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {reward.type === 'discount' && <Percent className="h-5 w-5 text-blue-500" />}
                        {reward.type === 'product' && <Gift className="h-5 w-5 text-green-500" />}
                        {reward.type === 'free_delivery' && <CreditCard className="h-5 w-5 text-purple-500" />}
                        <h3 className="font-semibold">{reward.name}</h3>
                      </div>
                      <Switch checked={reward.isActive} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{reward.pointsRequired} pontos</Badge>
                      <div className="text-sm text-muted-foreground">
                        {reward.redemptions} resgates
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Nova Recompensa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros do Programa</CardTitle>
              <CardDescription>Clientes inscritos no programa de fidelidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: tiers.find(t => t.name === customer.tier)?.color,
                              color: tiers.find(t => t.name === customer.tier)?.color
                            }}
                          >
                            {customer.tier}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4 text-sm">
                        <div>
                          <div className="font-medium">{customer.points} pts</div>
                          <div className="text-muted-foreground">Pontos</div>
                        </div>
                        <div>
                          <div className="font-medium">R$ {customer.totalSpent}</div>
                          <div className="text-muted-foreground">Total gasto</div>
                        </div>
                        <div>
                          <div className="font-medium">{customer.ordersCount}</div>
                          <div className="text-muted-foreground">Pedidos</div>
                        </div>
                        <div>
                          <div className="font-medium">{customer.lastVisit}</div>
                          <div className="text-muted-foreground">Última visita</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Programa</CardTitle>
              <CardDescription>Ajuste as configurações do programa de fidelidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="programName">Nome do Programa</Label>
                  <Input id="programName" defaultValue={program?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsPerPurchase">Pontos por R$1</Label>
                  <Input 
                    id="pointsPerPurchase" 
                    type="number" 
                    step="0.1"
                    defaultValue={program?.pointsPerPurchase} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsValue">Valor do Ponto (R$)</Label>
                  <Input 
                    id="pointsValue" 
                    type="number" 
                    step="0.001"
                    defaultValue={program?.pointsValue} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
                  <Input 
                    id="minOrderValue" 
                    type="number" 
                    step="0.01"
                    defaultValue={program?.minOrderValue} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  defaultValue={program?.description} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" defaultChecked={program?.isActive} />
                <Label htmlFor="isActive">Programa Ativo</Label>
              </div>
              <div className="flex space-x-2">
                <Button>Salvar Alterações</Button>
                <Button variant="outline">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}