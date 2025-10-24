import { MessageSquare, ScanLine, CheckCircle, FileDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Solution = () => {
  const { language, t } = useLanguage();
  
  const steps = [
    {
      icon: MessageSquare,
      title: t['solution.voiceChat'],
      subtitle: "Input",
      description: t['solution.voiceChatDesc'],
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: ScanLine,
      title: t['solution.smartForms'],
      subtitle: "Process",
      description: t['solution.smartFormsDesc'],
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200"
    },
    {
      icon: CheckCircle,
      title: t['solution.multiLanguage'],
      subtitle: "Verify",
      description: t['solution.multiLanguageDesc'],
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      icon: FileDown,
      title: t['solution.instantHelp'],
      subtitle: "Output",
      description: t['solution.instantHelpDesc'],
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container-width section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t['solution.title']} <span className="gradient-text">Karnataka Mitra</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t['solution.subtitle']}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`p-8 rounded-2xl bg-white border-2 ${step.borderColor} shadow-card card-hover animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} mb-6`}>
                  <Icon size={32} />
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {step.subtitle}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Solution;