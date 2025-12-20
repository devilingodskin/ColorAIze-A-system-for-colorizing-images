import { Link, useLocation } from "wouter";
import { Aperture, Image as ImageIcon, Github } from "lucide-react";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Раскрасить", icon: Aperture },
    { href: "/gallery", label: "Галерея", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col font-sans">
      <header className="border-b border-gray-200/50 liquid-glass sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Aperture className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-gray-900">
              Color<span className="text-gray-600">AI</span>ze
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200",
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-gray-200/50 py-8 liquid-glass mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>© 2024 ColorAIze. Раскрашивание изображений с помощью ИИ.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Система работает
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
