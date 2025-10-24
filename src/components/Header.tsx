import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: t('header.home'), href: "#home" },
    { label: t('header.features'), href: "#features" },
    { label: t('header.workflow'), href: "#workflow" },
    { label: t('header.contact'), href: "#contact" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container-width section-padding">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            {/* Karnataka Government Logo */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src="https://th.bing.com/th/id/OIP.v008MMXM_bKmFFcXHhH_BAHaHa?w=192&h=192&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3" 
                alt="Karnataka Government Logo" 
                className="w-24 h-24 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback placeholder (hidden by default) */}
              <div className="hidden">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">KA</span>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text">
              Karnataka Mitra
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="flex items-center space-x-1"
            >
              <Globe size={16} />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </Button>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="flex items-center"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            
            <Link to="/services/driving-license">
              <Button variant="outline" size="sm">
                DL Service
              </Button>
            </Link>
            
            <Link to="/notifications">
              <Button variant="outline" size="sm">
                🔔 Notifications
              </Button>
            </Link>
            
            <Link to="/payments">
              <Button variant="outline" size="sm">
                💳 Payments
              </Button>
            </Link>
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                🏛️ Admin
              </Button>
            </Link>
            
            <Link to="/citizens">
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                👥 Citizens
              </Button>
            </Link>
            
            <Link to="/demo">
              <Button variant="demo" size="sm">
                {t('header.tryDemo')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-sm dark:bg-background/95">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Controls */}
              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1"
                >
                  <Globe size={16} />
                  <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleTheme}
                  className="flex items-center"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </Button>
              </div>
              
              <Link to="/services/driving-license" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  DL Service
                </Button>
              </Link>
              
              <Link to="/notifications" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  🔔 Notifications
                </Button>
              </Link>
              
              <Link to="/payments" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  💳 Payments
                </Button>
              </Link>
              
              <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="mt-2 w-full bg-red-50 text-red-700 border-red-200">
                  🏛️ Admin
                </Button>
              </Link>
              
              <Link to="/citizens" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="mt-2 w-full bg-blue-50 text-blue-700 border-blue-200">
                  👥 Citizens
                </Button>
              </Link>
              
              <Link to="/demo" onClick={() => setIsMenuOpen(false)}>
                <Button variant="demo" size="sm" className="mt-2 w-full">
                  {t('header.tryDemo')}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;