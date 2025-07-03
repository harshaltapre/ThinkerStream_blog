import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  MessageCircle, 
  BarChart3, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      label: "Dashboard", 
      href: "/admin", 
      icon: LayoutDashboard 
    },
    { 
      label: "Posts", 
      href: "/admin/posts", 
      icon: FileText 
    },
    { 
      label: "Categories", 
      href: "/admin/categories", 
      icon: FolderOpen 
    },
    { 
      label: "Comments", 
      href: "/admin/comments", 
      icon: MessageCircle 
    },
    { 
      label: "Analytics", 
      href: "/admin/analytics", 
      icon: BarChart3 
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 admin-sidebar text-white min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TS</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">ThinkSpeak</h2>
            <p className="text-sm text-gray-300">Admin Dashboard</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left text-gray-300 hover:text-white hover:bg-white/10 ${
                    isActive ? "bg-white/10 text-white" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <Separator className="mb-4 bg-gray-700" />
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-white/10"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
