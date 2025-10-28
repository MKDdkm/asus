import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section id="home" className="pt-32 pb-20 bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <div className="container-width section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Government Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Government of Karnataka</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                {t('hero.title')}{" "}
                <span className="text-primary">{t('hero.subtitle')}</span> AI Assistant
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('hero.description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/demo">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12 rounded-lg transition-all"
                >
                  {t('hero.tryDemo')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-medium px-8 h-12 rounded-lg"
              >
                {t('hero.learnMore')}
              </Button>
            </div>

            {/* Trust Indicators - Professional Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-3xl font-bold text-foreground">2.8K+</div>
                </div>
                <div className="text-sm text-muted-foreground">{t('hero.citizensHelped')}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div className="text-3xl font-bold text-foreground">156+</div>
                </div>
                <div className="text-sm text-muted-foreground">{t('hero.governmentSchemes')}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div className="text-3xl font-bold text-foreground">87%</div>
                </div>
                <div className="text-sm text-muted-foreground">{t('hero.successRate')}</div>
              </div>
            </div>
          </div>

          {/* Right Image - Clean Professional */}
          <div className="relative">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-card border border-border">
              <img
                src={heroImage}
                alt="AI Assistant helping with government forms"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;