import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";
import { Home, Users, UserPlus, BookOpen, Link2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sidebarOverrides =
  "[&_[data-sidebar=sidebar]]:bg-slate-800 [&_[data-sidebar=sidebar]]:text-white [&_[data-sidebar=sidebar]]:border-slate-700 [&_.text-sidebar-foreground]:text-slate-200 [&_[data-sidebar=menu-button]]:data-[active=true]:bg-sky-600 [&_[data-sidebar=menu-button]]:data-[active=true]:text-white [&_[data-sidebar=menu-button]]:hover:bg-slate-700 [&_[data-sidebar=group-label]]:text-sky-200";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar className={cn("border-r border-slate-700", sidebarOverrides)}>
        <SidebarHeader className="border-b border-slate-700/50">
          <div className="flex items-center gap-2 px-3 py-4">
            <span className="font-semibold text-white">SIMP Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sky-200/90">PRINCIPAL</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                    <NavLink to="/admin" className="flex items-center gap-2">
                      <Home className="size-4" />
                      <span>Principal</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <Separator className="mx-2 bg-slate-600/50" />
          <SidebarGroup>
            <SidebarGroupLabel className="text-sky-200/90">USUÁRIOS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/admin/usuarios/novo"}>
                    <NavLink to="/admin/usuarios/novo" className="flex items-center gap-2">
                      <UserPlus className="size-4" />
                      <span>Novo</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                    <NavLink to="/admin" className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>Colaborador / admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <Separator className="mx-2 bg-slate-600/50" />
          <SidebarGroup>
            <SidebarGroupLabel className="text-sky-200/90">TURMAS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                    <NavLink to="/admin" className="flex items-center gap-2">
                      <BookOpen className="size-4" />
                      <span>Turmas e vínculos</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className="flex items-center gap-2">
                      <Link2 className="size-4" />
                      <span>Vincular professor</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-700/50 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-slate-200 hover:bg-slate-700 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex flex-1 flex-col min-h-svh bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
