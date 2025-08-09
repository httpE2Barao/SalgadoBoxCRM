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
import { 
  Settings, 
  Store, 
  Bell, 
  Users, 
  CreditCard, 
  Truck,
  Clock,
  Smartphone,
  Shield,
  Palette,
  Database,
  Save,
  RefreshCw
} from 'lucide-react'

interface RestaurantSettings {
  name: string
  description: string
  phone: string
  email: string
  address: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  currency: string
  timezone: string
}

interface OperationalSettings {
  deliveryEnabled: boolean
  takeawayEnabled: boolean
  dineInEnabled: boolean
  deliveryFee: number
  minimumOrder: number
  deliveryRadius: number
  preparationTime: number
  openingHours: Array<{
    day: string
    open: string
    close: string
    enabled: boolean
  }>
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  orderNotifications: boolean
  customerNotifications: boolean
  marketingNotifications: boolean
}

interface PaymentSettings {
  cashEnabled: boolean
  pixEnabled: boolean
  creditCardEnabled: boolean
  debitCardEnabled: boolean
  otherMethodsEnabled: boolean
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<RestaurantSettings>({
    name: 'Salgado Box',
    description: 'Restaurante especializado em salgados e lanches',
    phone: '(11) 9999-9999',
    email: 'contato@salgadobox.com.br',
    address: 'Rua Principal, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo'
  })

  const [operational, setOperational] = useState<OperationalSettings>({
    deliveryEnabled: true,
    takeawayEnabled: true,
    dineInEnabled: true,
    deliveryFee: 5.00,
    minimumOrder: 20.00,
    deliveryRadius: 5,
    preparationTime: 15,
    openingHours: [
      { day: 'Segunda', open: '08:00', close: '22:00', enabled: true },
      { day: 'Terça', open: '08:00', close: '22:00', enabled: true },
      { day: 'Quarta', open: '08:00', close: '22:00', enabled: true },
      { day: 'Quinta', open: '08:00', close: '22:00', enabled: true },
      { day: 'Sexta', open: '08:00', close: '23:00', enabled: true },
      { day: 'Sábado', open: '08:00', close: '23:00', enabled: true },
      { day: 'Domingo', open: '08:00', close: '21:00', enabled: true },
    ]
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    customerNotifications: true,
    marketingNotifications: false
  })

  const [payments, setPayments] = useState<PaymentSettings>({
    cashEnabled: true,
    pixEnabled: true,
    creditCardEnabled: true,
    debitCardEnabled: true,
    otherMethodsEnabled: false
  })

  useEffect(() => {
    // Simular carregamento das configurações
    const loadSettings = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Aqui você salvaria as configurações no backend
  }

  const updateOpeningHours = (index: number, field: string, value: any) => {
    const newHours = [...operational.openingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setOperational({ ...operational, openingHours: newHours })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do seu estabelecimento
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="restaurant" className="space-y-4">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurante</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Informações do Restaurante
              </CardTitle>
              <CardDescription>
                Dados básicos do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Restaurante</Label>
                  <Input
                    id="name"
                    value={restaurant.name}
                    onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={restaurant.currency} onValueChange={(value) => setRestaurant({ ...restaurant, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={restaurant.description}
                  onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>
                Localização do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={restaurant.address}
                    onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={restaurant.neighborhood}
                    onChange={(e) => setRestaurant({ ...restaurant, neighborhood: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={restaurant.city}
                    onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={restaurant.state} onValueChange={(value) => setRestaurant({ ...restaurant, state: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={restaurant.zipCode}
                    onChange={(e) => setRestaurant({ ...restaurant, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Serviços Disponíveis
              </CardTitle>
              <CardDescription>
                Configure quais serviços seu restaurante oferece
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Delivery</Label>
                    <p className="text-sm text-muted-foreground">Entregas no local</p>
                  </div>
                  <Switch
                    checked={operational.deliveryEnabled}
                    onCheckedChange={(checked) => setOperational({ ...operational, deliveryEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Retirada</Label>
                    <p className="text-sm text-muted-foreground">Retirada no local</p>
                  </div>
                  <Switch
                    checked={operational.takeawayEnabled}
                    onCheckedChange={(checked) => setOperational({ ...operational, takeawayEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Local</Label>
                    <p className="text-sm text-muted-foreground">Consumo no local</p>
                  </div>
                  <Switch
                    checked={operational.dineInEnabled}
                    onCheckedChange={(checked) => setOperational({ ...operational, dineInEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Configurações de Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Taxa de Entrega</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    value={operational.deliveryFee}
                    onChange={(e) => setOperational({ ...operational, deliveryFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Pedido Mínimo</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    value={operational.minimumOrder}
                    onChange={(e) => setOperational({ ...operational, minimumOrder: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">Raio de Entrega (km)</Label>
                  <Input
                    id="deliveryRadius"
                    type="number"
                    value={operational.deliveryRadius}
                    onChange={(e) => setOperational({ ...operational, deliveryRadius: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operational.openingHours.map((hours, index) => (
                <div key={hours.day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <Label className="text-sm">{hours.day}</Label>
                  </div>
                  <Switch
                    checked={hours.enabled}
                    onCheckedChange={(checked) => updateOpeningHours(index, 'enabled', checked)}
                  />
                  {hours.enabled && (
                    <>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateOpeningHours(index, 'open', e.target.value)}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">às</span>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateOpeningHours(index, 'close', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Métodos de Pagamento
              </CardTitle>
              <CardDescription>
                Selecione quais métodos de pagamento são aceitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Dinheiro</Label>
                    <p className="text-sm text-muted-foreground">Pagamento em espécie</p>
                  </div>
                  <Switch
                    checked={payments.cashEnabled}
                    onCheckedChange={(checked) => setPayments({ ...payments, cashEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">PIX</Label>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                  <Switch
                    checked={payments.pixEnabled}
                    onCheckedChange={(checked) => setPayments({ ...payments, pixEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Cartão de Crédito</Label>
                    <p className="text-sm text-muted-foreground">Pagamento parcelado</p>
                  </div>
                  <Switch
                    checked={payments.creditCardEnabled}
                    onCheckedChange={(checked) => setPayments({ ...payments, creditCardEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Cartão de Débito</Label>
                    <p className="text-sm text-muted-foreground">Débito em conta</p>
                  </div>
                  <Switch
                    checked={payments.debitCardEnabled}
                    onCheckedChange={(checked) => setPayments({ ...payments, debitCardEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Gerencie como e quando você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Email</Label>
                    <p className="text-sm text-muted-foreground">Notificações por email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">SMS</Label>
                    <p className="text-sm text-muted-foreground">Notificações por SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Push</Label>
                    <p className="text-sm text-muted-foreground">Notificações push</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Notificação</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Novos Pedidos</Label>
                      <p className="text-sm text-muted-foreground">Receba alertas de novos pedidos</p>
                    </div>
                    <Switch
                      checked={notifications.orderNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, orderNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Clientes</Label>
                      <p className="text-sm text-muted-foreground">Atualizações de clientes</p>
                    </div>
                    <Switch
                      checked={notifications.customerNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, customerNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Marketing</Label>
                      <p className="text-sm text-muted-foreground">Campanhas e promoções</p>
                    </div>
                    <Switch
                      checked={notifications.marketingNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketingNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">Proteja sua conta com 2FA</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Log de Atividades</Label>
                    <p className="text-sm text-muted-foreground">Registre todas as atividades</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Backup e Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Faça backup diário dos dados</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Limpeza de Cache</Label>
                    <p className="text-sm text-muted-foreground">Limpe cache automaticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">Exportar Dados</Button>
                <Button variant="outline">Importar Dados</Button>
                <Button variant="destructive">Limpar Dados</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}