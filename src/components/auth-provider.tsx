'use client'

import { useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChefHat, Lock } from 'lucide-react'
import { SidebarNav } from '@/components/sidebar-nav'

interface AuthProviderProps {
  children: React.ReactNode
}

// Contexto para compartilhar estado de autenticação
export const AuthContext = createContext<{
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
}>({
  isAuthenticated: true, // Mudar para true para bypass temporário
  isLoading: false,
  logout: () => {}
})

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = ['/public-menu']

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Sempre autenticado
  const [showAuth, setShowAuth] = useState(false) // Nunca mostrar auth
  const [isLoading, setIsLoading] = useState(false) // Nunca carregar
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'salgadoscomoramor') {
      setIsAuthenticated(true)
      setShowAuth(false)
      if (typeof window !== 'undefined') {
        localStorage.setItem('salgadoscomoramor_auth', 'true')
      }
      setError('')
    } else {
      setError('Senha incorreta')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowAuth(true)
    setPassword('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salgadoscomoramor_auth')
    }
    router.push('/')
  }

  // Valor do contexto
  const contextValue = {
    isAuthenticated,
    isLoading,
    logout: handleLogout
  }

  // Se for uma rota pública, mostrar o conteúdo diretamente
  if (PUBLIC_ROUTES.includes(pathname)) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    )
  }

  // Se estiver carregando, mostrar tela de carregamento
  if (isLoading) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  // Se não estiver autenticado, mostrar tela de login
  if (showAuth) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md px-4">
            <Card className="w-full shadow-xl border-0">
              <CardHeader className="text-center space-y-6 pb-8">
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-10 w-10 text-primary" />
                    <span className="text-2xl font-bold text-primary">SALGADO BOX</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">Acesso Restrito</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Digite a senha para acessar o sistema administrativo
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Digite a senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 text-base"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold">
                    Acessar Sistema
                  </Button>
                </form>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/public-menu'
                    }}
                    className="w-full h-12 text-base font-medium"
                  >
                    Ver Cardápio Público
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  // Se estiver autenticado, mostrar o conteúdo com botão de logout e sidebar
  return (
    <AuthContext.Provider value={contextValue}>
      <div className="flex h-screen">
        {/* Mostrar sidebar apenas se o usuário estiver autenticado */}
        <SidebarNav />
        <main className="flex-1 overflow-auto lg:ml-64">
          <div className="min-h-full">
            <div className="fixed top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-background shadow-md"
              >
                Sair do Sistema
              </Button>
            </div>
            <div className="pt-16 lg:pt-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  )
}