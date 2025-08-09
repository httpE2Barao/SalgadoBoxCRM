"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ChefHat, 
  ShoppingCart, 
  Users, 
  Tag, 
  Gift, 
  BarChart3,
  Settings,
  Package,
  Menu as MenuIcon,
  X,
  Store,
  CreditCard,
  Bell,
  FileText,
  Truck,
  Clock,
  TrendingUp,
  Users2,
  Star,
  Percent,
  Headphones,
  HelpCircle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

const navigation = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Pedidos", href: "/orders", icon: ShoppingCart },
      { name: "Cardápio", href: "/menu", icon: ChefHat },
    ]
  },
  {
    title: "Operações",
    items: [
      { name: "Estoque", href: "/estoque", icon: Package },
      { name: "Clientes", href: "/customers", icon: Users },
      { name: "Entregas", href: "/deliveries", icon: Truck },
      { name: "Reservas", href: "/reservations", icon: Clock },
    ]
  },
  {
    title: "Marketing",
    items: [
      { name: "Cupons", href: "/coupons", icon: Tag },
      { name: "Fidelidade", href: "/loyalty", icon: Gift },
      { name: "Promoções", href: "/promotions", icon: Percent },
      { name: "Avaliações", href: "/reviews", icon: Star },
    ]
  },
  {
    title: "Financeiro",
    items: [
      { name: "Vendas", href: "/sales", icon: TrendingUp },
      { name: "Pagamentos", href: "/payments", icon: CreditCard },
      { name: "Relatórios", href: "/analytics", icon: BarChart3 },
      { name: "Fiscal", href: "/fiscal", icon: FileText },
    ]
  },
  {
    title: "Sistema",
    items: [
      { name: "Configurações", href: "/settings", icon: Settings },
      { name: "Notificações", href: "/notifications", icon: Bell },
      { name: "Suporte", href: "/support", icon: Headphones },
      { name: "Ajuda", href: "/help", icon: HelpCircle },
    ]
  }
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <MenuIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Salgado Box</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navigation.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                localStorage.removeItem('salgadoscomamor_auth')
                window.location.href = '/'
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              © 2024 Salgado Box. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}