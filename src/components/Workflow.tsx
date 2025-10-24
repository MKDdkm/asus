import { MessageSquare, ScanLine, CheckCircle, FileDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Workflow = () => {
  const { language, t } = useLanguage();
  
  const steps = [
    {
      icon: MessageSquare,
      title: t['workflow.step1'],
      description: t['workflow.step1Desc']
    },
    {
      icon: ScanLine,
      title: t['workflow.step2'],
      description: t['workflow.step2Desc']
    },
    {
      icon: CheckCircle,
      title: t['workflow.step3'],
      description: t['workflow.step3Desc']
    },
    {
      icon: FileDown,
      title: "Output",
      description: "Download PDF"
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-white">
      <div className="container-width section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t['workflow.title']}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t['workflow.subtitle']}
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-primary transform -translate-y-1/2 z-0"></div>
            
            {/* Timeline Steps */}
            <div className="relative z-10 flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                    {/* Icon Circle */}
                    <div className="w-20 h-20 bg-white border-4 border-primary rounded-full flex items-center justify-center shadow-elegant mb-4">
                      <Icon size={32} className="text-primary" />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-card">
                    <Icon size={24} className="text-primary-foreground" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {/* Arrow (except last item) */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="text-muted-foreground" size={20} />
                  )}
                </div>
                
                {/* Connecting Line (except last item) */}
                {index < steps.length - 1 && (
                  <div className="ml-8 mt-4 mb-4 w-0.5 h-8 bg-border"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="mx-auto max-w-3xl flex flex-col md:flex-row items-center gap-4 p-6 bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl shadow-glow">
            <div className="flex-1 text-left md:text-left text-white">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-1">{t['workflow.ctaTitle'] ?? 'Ready to get started?'}</h3>
              <p className="text-white/90 max-w-xl">{t['workflow.ctaDesc'] ?? 'Try our demo and see how easy it is'}</p>
            </div>

            <div className="flex-shrink-0">
              <Link to="/demo" aria-label={t['hero.tryDemo'] ?? 'Try Demo'}>
                <button
                  className="inline-flex items-center space-x-3 bg-white text-orange-600 px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <span>{t['hero.tryDemo'] ?? 'Try Demo'}</span>
                  <ArrowRight size={18} className="text-orange-600" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;