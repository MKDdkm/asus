import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ExportToExcel from "@/components/ExportToExcel";
import { 
  FileText, 
  CreditCard, 
  Users, 
  Home, 
  Briefcase, 
  GraduationCap,
  Heart,
  Car,
  Building,
  Zap,
  Shield,
  Globe,
  Download,
  Database
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  const fetchExportData = async () => {
    try {
      setLoading(true);
      // Fetch citizens
      const citizensRes = await fetch(`${API_BASE_URL}/citizens`);
      const citizensData = await citizensRes.json();
      if (citizensData.success) {
        setCitizens(citizensData.data || []);
      }

      // Fetch applications
      const appsRes = await fetch(`${API_BASE_URL}/applications`);
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplications(appsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransportClick = () => {
    navigate('/services/driving-license');
  };

  const handleFinancialClick = () => {
    navigate('/services/income-certificate');
  };

  const serviceCategories = [
    {
      icon: FileText,
      title: t('services.identity.title'),
      description: t('services.identity.description'),
      services: [
        t('services.identity.aadhaar'),
        t('services.identity.pan'),
        t('services.identity.passport'),
        t('services.identity.voterCard')
      ],
      iconColor: "text-primary",
      badge: "4 Services"
    },
    {
      icon: CreditCard,
      title: t('services.financial.title'),
      description: t('services.financial.description'),
      services: [
        t('services.financial.ration'),
        t('services.financial.bpl'),
        t('services.financial.pension'),
        t('services.financial.scholarship')
      ],
      iconColor: "text-success",
      badge: "12 Services"
    },
    {
      icon: Users,
      title: t('services.family.title'),
      description: t('services.family.description'),
      services: [
        t('services.family.birth'),
        t('services.family.death'),
        t('services.family.marriage'),
        t('services.family.caste')
      ],
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
      badge: "8 Services"
    },
    {
      icon: Home,
      title: t('services.property.title'),
      description: t('services.property.description'),
      services: [
        t('services.property.khata'),
        t('services.property.survey'),
        t('services.property.mutation'),
        t('services.property.registration')
      ],
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600",
      badge: "15 Services"
    },
    {
      icon: Briefcase,
      title: t('services.business.title'),
      description: t('services.business.description'),
      services: [
        t('services.business.license'),
        t('services.business.trade'),
        t('services.business.gst'),
        t('services.business.msme')
      ],
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      iconColor: "text-indigo-600",
      badge: "25 Services"
    },
    {
      icon: GraduationCap,
      title: t('services.education.title'),
      description: t('services.education.description'),
      services: [
        t('services.education.admission'),
        t('services.education.transfer'),
        t('services.education.scholarship'),
        t('services.education.certificates')
      ],
      color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
      iconColor: "text-teal-600",
      badge: "18 Services"
    },
    {
      icon: Heart,
      title: t('services.health.title'),
      description: t('services.health.description'),
      services: [
        t('services.health.insurance'),
        t('services.health.ayushman'),
        t('services.health.medical'),
        t('services.health.disability')
      ],
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
      iconColor: "text-pink-600",
      badge: "22 Services"
    },
    {
      icon: Car,
      title: t('services.transport.title'),
      description: t('services.transport.description'),
      services: [
        t('services.transport.license'),
        t('services.transport.registration'),
        t('services.transport.permit'),
        t('services.transport.fitness')
      ],
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      iconColor: "text-red-600",
      badge: "16 Services"
    },
    {
      icon: Building,
      title: t('services.agriculture.title'),
      description: t('services.agriculture.description'),
      services: [
        t('services.agriculture.subsidy'),
        t('services.agriculture.loan'),
        t('services.agriculture.insurance'),
        t('services.agriculture.landRecord')
      ],
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
      iconColor: "text-yellow-600",
      badge: "28 Services"
    },
    {
      icon: Zap,
      title: t('services.utilities.title'),
      description: t('services.utilities.description'),
      services: [
        t('services.utilities.electricity'),
        t('services.utilities.water'),
        t('services.utilities.gas'),
        t('services.utilities.grievance')
      ],
      color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
      iconColor: "text-cyan-600",
      badge: "14 Services"
    },
    {
      icon: Shield,
      title: t('services.police.title'),
      description: t('services.police.description'),
      services: [
        t('services.police.verification'),
        t('services.police.noc'),
        t('services.police.fir'),
        t('services.police.passport')
      ],
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      iconColor: "text-gray-600",
      badge: "11 Services"
    },
    {
      icon: Globe,
      title: t('services.others.title'),
      description: t('services.others.description'),
      services: [
        t('services.others.grievance'),
        t('services.others.rti'),
        t('services.others.complaint'),
        t('services.others.feedback')
      ],
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      iconColor: "text-emerald-600",
      badge: "20+ Services"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-background">
      <div className="container-width section-padding">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serviceCategories.map((category, index) => {
            const Icon = category.icon;
            const isTransport = category.title === t('services.transport.title');
            const isFinancial = category.title === t('services.financial.title');
            return (
              <Card
                key={category.title}
                className="bg-white dark:bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-card cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={isTransport ? handleTransportClick : isFinancial ? handleFinancialClick : undefined}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${category.iconColor} bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors duration-200`}>
                      <Icon size={22} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {category.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.services.map((service, serviceIndex) => (
                      <li 
                        key={serviceIndex} 
                        className="text-sm text-muted-foreground flex items-center"
                      >
                        <div className="w-1.5 h-1.5 bg-current rounded-full mr-2 opacity-60"></div>
                        {service}
                      </li>
                    ))}
                  </ul>
                  {isTransport && (
                    <div className="mt-4 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransportClick();
                        }}
                      >
                        Try Driving License Service →
                      </Button>
                    </div>
                  )}
                  {isFinancial && (
                    <div className="mt-4 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinancialClick();
                        }}
                      >
                        Apply for Income Certificate →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Tools Section - Export Data */}
        <div className="mt-20 p-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-xl border-2 border-primary/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Admin Tools - Data Export
            </h3>
            <p className="text-muted-foreground mt-2">
              Download citizens and applications data in Excel format
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Citizens Export Card */}
            <Card className="border-border shadow-sm hover:shadow-card transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Citizens Database
                </CardTitle>
                <CardDescription>
                  Export all registered citizens information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-sm font-medium text-foreground">Total Citizens:</span>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {loading ? '...' : citizens.length}
                  </Badge>
                </div>
                <ExportToExcel
                  data={citizens}
                  filename="citizens_database"
                  sheetName="Citizens"
                  buttonText="Download Citizens Excel"
                  variant="default"
                  icon={true}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full hover:bg-primary/5"
                  onClick={() => navigate('/citizens')}
                >
                  Manage Citizens →
                </Button>
              </CardContent>
            </Card>

            {/* Applications Export Card */}
            <Card className="border-border shadow-sm hover:shadow-card transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Applications Database
                </CardTitle>
                <CardDescription>
                  Export all service applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-sm font-medium text-foreground">Total Applications:</span>
                  <Badge variant="secondary" className="text-base font-semibold">
                    {loading ? '...' : applications.length}
                  </Badge>
                </div>
                <ExportToExcel
                  data={applications}
                  filename="applications_database"
                  sheetName="Applications"
                  buttonText="Download Applications Excel"
                  variant="default"
                  icon={true}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/admin')}
                >
                  Manage Applications →
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              onClick={fetchExportData}
              disabled={loading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Loading Data...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            {t('services.cta')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="outline" className="text-lg py-2 px-6">
              156+ {t('services.totalServices')}
            </Badge>
            <Badge variant="outline" className="text-lg py-2 px-6">
              {t('services.availability')}
            </Badge>
            <Badge variant="outline" className="text-lg py-2 px-6">
              {t('services.languages')}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;