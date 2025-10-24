import { Mail, Linkedin, Github, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language, t } = useLanguage();
  
  const socialLinks = [
    {
      icon: Mail,
      label: "Email",
      href: "mailto:contact@karnatakmitra.gov.in"
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "#"
    },
    {
      icon: Github,
      label: "GitHub",
      href: "#"
    }
  ];

  return (
    <footer id="contact" className="py-16 bg-gradient-primary">
      <div className="container-width section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">{t['footer.title']}</h3>
            <p className="text-white/90 text-lg leading-relaxed mb-6">
              {t['footer.description']}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                    aria-label={link.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t['footer.quickLinks']}</h4>
            <nav className="space-y-3">
              {["Home", "Features", "Workflow", "About"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-white/80 hover:text-white transition-colors duration-300"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t['footer.resources']}</h4>
            <div className="space-y-3 text-white/80">
              <p>contact@karnatakmitra.gov.in</p>
              <p>Available 24/7 for support</p>
              <p>Made with ❤️ for citizens</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-white">
              <span>Built with</span>
              <Heart className="text-red-400 fill-current" size={16} />
              <span>to empower every citizen</span>
            </div>
            <div className="text-white/80 text-sm">
              © 2024 Karnataka Mitra. Making government services accessible to all.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;