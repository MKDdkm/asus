import { FileText, Globe, DollarSign, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Problem = () => {
  const { language, t } = useLanguage();
  
  const problems = [
    {
      icon: FileText,
      title: t['problem.confusingForms'],
      description: t['problem.confusingFormsDesc'],
      color: "text-red-500"
    },
    {
      icon: Globe,
      title: t['problem.languageBarriers'],
      description: t['problem.languageBarriersDesc'],
      color: "text-orange-500"
    },
    {
      icon: DollarSign,
      title: t['problem.costlyMiddlemen'],
      description: t['problem.costlyMiddlemenDesc'],
      color: "text-yellow-500"
    },
    {
      icon: Clock,
      title: t['problem.timeConsuming'],
      description: t['problem.timeConsumingDesc'],
      color: "text-blue-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-width section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t['problem.title']}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t['problem.subtitle']}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 ${problem.color}`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Problem;