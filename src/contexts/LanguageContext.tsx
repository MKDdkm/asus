 import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.home': 'Home',
    'header.features': 'Features',
    'header.workflow': 'Workflow',
    'header.contact': 'Contact',
    'header.tryDemo': 'Try Demo',
    
    // Hero Section
    'hero.title': 'Karnataka Government Services Made Simple with',
    'hero.subtitle': 'Karnataka Mitra',
    'hero.description': 'Your official digital gateway to Karnataka Government services. Seamlessly access Aadhaar updates, ration card applications, BPL certificates, pension schemes, and 156+ government services through intelligent assistance. Experience paperless convenience with zero office visits, no intermediaries - just direct, secure access to your citizen entitlements.',
    'hero.tryDemo': 'Try Demo',
    'hero.learnMore': 'Learn More',
    'hero.citizensHelped': 'Karnataka Citizens Served',
    'hero.governmentSchemes': 'Government Services Available',
    'hero.successRate': 'Success Rate',
    
    // Problem Section
    'problem.title': 'The Problem',
    'problem.subtitle': 'Citizens face numerous challenges when trying to access government services and benefits',
    'problem.confusingForms': 'Confusing Forms',
    'problem.confusingFormsDesc': 'Complex government forms with technical language that\'s hard to understand',
    'problem.languageBarriers': 'Language Barriers',
    'problem.languageBarriersDesc': 'Forms only available in English or limited local languages',
    'problem.costlyMiddlemen': 'Costly Middlemen',
    'problem.costlyMiddlemenDesc': 'Expensive agents who charge high fees for simple form filling',
    'problem.timeConsuming': 'Time Consuming',
    'problem.timeConsumingDesc': 'Long queues and multiple visits to government offices',
    
    // Solution Section
    'solution.title': 'Our Solution –',
    'solution.subtitle': 'A friendly assistant that talks to you, understands your documents, and fills your forms correctly',
    'solution.voiceChat': 'Voice Chat',
    'solution.voiceChatDesc': 'Talk naturally in your language - no typing required',
    'solution.smartForms': 'Smart Forms',
    'solution.smartFormsDesc': 'AI fills forms automatically from your conversation',
    'solution.multiLanguage': 'Multi-Language',
    'solution.multiLanguageDesc': 'Support for Kannada, Hindi, English and more',
    'solution.instantHelp': 'Instant Help',
    'solution.instantHelpDesc': '24/7 assistance whenever you need it',
    
    // Workflow Section
    'workflow.title': 'How It Works',
    'workflow.subtitle': 'Simple 3-step process to get your government forms filled',
    'workflow.step1': 'Tell Us What You Need',
    'workflow.step1Desc': 'Just say what government service you want to apply for',
    'workflow.step2': 'Chat With Karnataka Mitra',
    'workflow.step2Desc': 'Our AI asks simple questions to understand your situation',
    'workflow.step3': 'Get Your Form Ready',
    'workflow.step3Desc': 'Download your completed form, ready to submit',
    'workflow.ctaTitle': 'Ready to get started?',
    'workflow.ctaDesc': 'Try our demo and see how easy it is',
    
    // DigiLocker Integration
    'digilocker.title': 'DigiLocker Integration',
    'digilocker.description': 'Fetch your documents directly from DigiLocker',
    'digilocker.connect': 'Connect to DigiLocker',
    'digilocker.connecting': 'Connecting...',
    'digilocker.connected': 'Connected to DigiLocker successfully',
    'digilocker.secureNote': 'Secure OAuth 2.0 authentication',
    'digilocker.fetchingDocs': 'Fetching your documents...',
    'digilocker.availableDocs': 'Available Documents',
    'digilocker.noDocs': 'No documents found',
    'digilocker.fetch': 'Fetch',
    'digilocker.aadhaar': 'Aadhaar Card',
    'digilocker.pan': 'PAN Card',
    'digilocker.drivingLicense': 'Driving License',
    'digilocker.vehicleRC': 'Vehicle RC',
    'digilocker.educationCert': 'Education Certificate',
    'digilocker.birthCert': 'Birth Certificate',
    'digilocker.connectionError': 'Failed to connect to DigiLocker',
    'digilocker.tokenError': 'Failed to authenticate with DigiLocker',
    'digilocker.fetchError': 'Failed to fetch documents',
    'digilocker.downloadError': 'Failed to download document',
    'digilocker.downloadSuccess': 'Document fetched successfully!',
    
    // Footer
    'footer.title': 'Karnataka Mitra',
    'footer.description': 'Smart government services with intelligent assistance. Empowering every citizen to access Karnataka government services with ease.',
    'footer.quickLinks': 'Quick Links',
    'footer.resources': 'Resources',
    'footer.contact': 'Contact',
    'footer.contactEmail': 'contact@karnatakmitra.gov.in',
    'footer.support': 'Available 24/7 for support',
    'footer.madeWithLove': 'Made with ❤️ for citizens',
    'footer.builtWith': 'Built with',
    'footer.empowerCitizens': 'to empower every citizen',
    'footer.copyright': '© 2024 Karnataka Mitra. Making government services accessible to all.',
    
    // Services Section
    'services.title': 'Government Services',
    'services.subtitle': 'Access 156+ Karnataka Government services through intelligent assistance. Choose from 12 major categories below.',
    'services.cta': 'All services available 24/7 with Karnataka Mitra intelligent assistance',
    'services.totalServices': 'Total Services',
    'services.availability': '24/7 Available',
    'services.languages': 'Multi-Language Support',
    
    // Identity Services
    'services.identity.title': 'Identity & Documents',
    'services.identity.description': 'Essential identity documents and verification services',
    'services.identity.aadhaar': 'Aadhaar Card Services',
    'services.identity.pan': 'PAN Card Application',
    'services.identity.passport': 'Passport Verification',
    'services.identity.voterCard': 'Voter ID Services',
    
    // Financial Services
    'services.financial.title': 'Financial Benefits',
    'services.financial.description': 'Government schemes, subsidies and financial assistance',
    'services.financial.ration': 'Ration Card Services',
    'services.financial.bpl': 'BPL Certificate',
    'services.financial.pension': 'Pension Schemes',
    'services.financial.scholarship': 'Government Scholarships',
    
    // Family Services
    'services.family.title': 'Family & Social',
    'services.family.description': 'Certificates for family events and social requirements',
    'services.family.birth': 'Birth Certificate',
    'services.family.death': 'Death Certificate',
    'services.family.marriage': 'Marriage Registration',
    'services.family.caste': 'Caste Certificate',
    
    // Property Services
    'services.property.title': 'Property & Land',
    'services.property.description': 'Land records, property registration and revenue services',
    'services.property.khata': 'Khata Services',
    'services.property.survey': 'Survey Settlement',
    'services.property.mutation': 'Property Mutation',
    'services.property.registration': 'Property Registration',
    
    // Business Services
    'services.business.title': 'Business & Trade',
    'services.business.description': 'Business licenses, registrations and commercial services',
    'services.business.license': 'Business License',
    'services.business.trade': 'Trade License',
    'services.business.gst': 'GST Registration',
    'services.business.msme': 'MSME Registration',
    
    // Education Services
    'services.education.title': 'Education Services',
    'services.education.description': 'School admissions, transfers and educational certificates',
    'services.education.admission': 'School Admission',
    'services.education.transfer': 'School Transfer',
    'services.education.scholarship': 'Education Scholarships',
    'services.education.certificates': 'Educational Certificates',
    
    // Health Services
    'services.health.title': 'Health & Medical',
    'services.health.description': 'Healthcare schemes, medical certificates and insurance',
    'services.health.insurance': 'Health Insurance',
    'services.health.ayushman': 'Ayushman Bharat',
    'services.health.medical': 'Medical Certificates',
    'services.health.disability': 'Disability Certificate',
    
    // Transport Services
    'services.transport.title': 'Transport & Vehicle',
    'services.transport.description': 'Driving licenses, vehicle registration and transport permits',
    'services.transport.license': 'Driving License',
    'services.transport.registration': 'Vehicle Registration',
    'services.transport.permit': 'Transport Permit',
    'services.transport.fitness': 'Vehicle Fitness',
    
    // Agriculture Services
    'services.agriculture.title': 'Agriculture & Farming',
    'services.agriculture.description': 'Farmer subsidies, agricultural loans and land records',
    'services.agriculture.subsidy': 'Farm Subsidies',
    'services.agriculture.loan': 'Agricultural Loans',
    'services.agriculture.insurance': 'Crop Insurance',
    'services.agriculture.landRecord': 'Land Records',
    
    // Utilities Services
    'services.utilities.title': 'Utilities & Public',
    'services.utilities.description': 'Electricity, water, gas connections and public grievances',
    'services.utilities.electricity': 'Electricity Connection',
    'services.utilities.water': 'Water Connection',
    'services.utilities.gas': 'Gas Connection',
    'services.utilities.grievance': 'Public Grievances',
    
    // Police Services
    'services.police.title': 'Police & Security',
    'services.police.description': 'Police verifications, NOCs and security clearances',
    'services.police.verification': 'Police Verification',
    'services.police.noc': 'Police NOC',
    'services.police.fir': 'FIR Online',
    'services.police.passport': 'Passport Verification',
    
    // Other Services
    'services.others.title': 'General Services',
    'services.others.description': 'RTI, complaints, feedback and miscellaneous services',
    'services.others.grievance': 'Grievance Redressal',
    'services.others.rti': 'RTI Applications',
    'services.others.complaint': 'Online Complaints',
    'services.others.feedback': 'Citizen Feedback',

    // Demo Page
    'demo.title': 'Karnataka Mitra Demo',
    'demo.backToHome': 'Back to Home',
    'demo.assistant': 'Karnataka Mitra Assistant',
    'demo.step1': 'Step 1: Tell us what you need',
    'demo.step2': 'Step 2: Provide your details',
    'demo.step3': 'Step 3: Review and download',
    'demo.typeMessage': 'Type your message...',
    'demo.send': 'Send',
    'demo.downloadForm': 'Download Completed Form',
    'demo.congratulations': '🎉 Congratulations! You\'ve successfully used Karnataka Mitra to fill your government form.',
    'demo.backHome': 'Back to Home',
    'demo.greeting': 'Hello! I\'m Karnataka Mitra, your government forms assistant. I\'m here to help you apply for government schemes easily. What would you like to apply for today?'
  },
  kn: {
    // Header
    'header.home': 'ಮುಖ್ಯ',
    'header.features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    'header.workflow': 'ಕಾರ್ಯವಿಧಾನ',
    'header.contact': 'ಸಂಪರ್ಕ',
    'header.tryDemo': 'ಡೆಮೋ ಪ್ರಯತ್ನಿಸಿ',
    
    // Hero Section
    'hero.title': 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸೇವೆಗಳು ಸರಳವಾಗಿ',
    'hero.subtitle': 'ಕರ್ನಾಟಕ ಮಿತ್ರದೊಂದಿಗೆ',
    'hero.description': 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸೇವೆಗಳಿಗೆ ನಿಮ್ಮ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಗೇಟ್‌ವೇ. ಆಧಾರ್ ನವೀಕರಣ, ರೇಷನ್ ಕಾರ್ಡ್ ಅರ್ಜಿಗಳು, BPL ಪ್ರಮಾಣಪತ್ರಗಳು, ಪಿಂಚಣಿ ಯೋಜನೆಗಳು ಮತ್ತು 156+ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಬುದ್ಧಿವಂತ ಸಹಾಯದ ಮೂಲಕ ನಿರರ್ಗಳವಾಗಿ ಪ್ರವೇಶಿಸಿ. ಕಚೇರಿ ಭೇಟಿಗಳಿಲ್ಲದೆ, ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ಕಾಗದರಹಿತ ಅನುಕೂಲತೆಯನ್ನು ಅನುಭವಿಸಿ - ನಿಮ್ಮ ನಾಗರಿಕ ಹಕ್ಕುಗಳಿಗೆ ನೇರ, ಸುರಕ್ಷಿತ ಪ್ರವೇಶ.',
    'hero.tryDemo': 'ಡೆಮೋ ಪ್ರಯತ್ನಿಸಿ',
    'hero.learnMore': 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    'hero.citizensHelped': 'ಕರ್ನಾಟಕ ನಾಗರಿಕರಿಗೆ ಸೇವೆ',
    'hero.governmentSchemes': 'ಲಭ್ಯವಿರುವ ಸರ್ಕಾರಿ ಸೇವೆಗಳು',
    'hero.successRate': 'ಯಶಸ್ಸಿನ ಪ್ರಮಾಣ',
    
    // Problem Section
    'problem.title': 'ಸಮಸ್ಯೆ',
    'problem.subtitle': 'ಸರ್ಕಾರಿ ಸೇವೆಗಳು ಮತ್ತು ಲಾಭಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ಪ್ರಯತ್ನಿಸುವಾಗ ನಾಗರಿಕರು ಅನೇಕ ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುತ್ತಾರೆ',
    'problem.confusingForms': 'ಗೊಂದಲಮಯ ನಮೂನೆಗಳು',
    'problem.confusingFormsDesc': 'ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಕಷ್ಟಕರವಾದ ತಾಂತ್ರಿಕ ಭಾಷೆಯೊಂದಿಗೆ ಸಂಕೀರ್ಣ ಸರ್ಕಾರಿ ನಮೂನೆಗಳು',
    'problem.languageBarriers': 'ಭಾಷಾ ತಡೆಗಳು',
    'problem.languageBarriersDesc': 'ಕೇವಲ ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಸೀಮಿತ ಸ್ಥಳೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವ ನಮೂನೆಗಳು',
    'problem.costlyMiddlemen': 'ದುಬಾರಿ ಮಧ್ಯವರ್ತಿಗಳು',
    'problem.costlyMiddlemenDesc': 'ಸರಳ ನಮೂನೆ ಭರ್ತಿಗಾಗಿ ಹೆಚ್ಚಿನ ಶುಲ್ಕ ವಿಧಿಸುವ ದುಬಾರಿ ಏಜೆಂಟ್‌ಗಳು',
    'problem.timeConsuming': 'ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುವ',
    'problem.timeConsumingDesc': 'ಸರ್ಕಾರಿ ಕಚೇರಿಗಳಿಗೆ ದೀರ್ಘ ಸಾಲುಗಳು ಮತ್ತು ಅನೇಕ ಭೇಟಿಗಳು',
    
    // Solution Section
    'solution.title': 'ನಮ್ಮ ಪರಿಹಾರ –',
    'solution.subtitle': 'ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡುವ, ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಮತ್ತು ನಿಮ್ಮ ನಮೂನೆಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡುವ ಸ್ನೇಹಪರ ಸಹಾಯಕ',
    'solution.voiceChat': 'ಧ್ವನಿ ಚಾಟ್',
    'solution.voiceChatDesc': 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ - ಟೈಪಿಂಗ್ ಅಗತ್ಯವಿಲ್ಲ',
    'solution.smartForms': 'ಸ್ಮಾರ್ಟ್ ನಮೂನೆಗಳು',
    'solution.smartFormsDesc': 'AI ನಿಮ್ಮ ಸಂಭಾಷಣೆಯಿಂದ ನಮೂನೆಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡುತ್ತದೆ',
    'solution.multiLanguage': 'ಬಹು ಭಾಷೆ',
    'solution.multiLanguageDesc': 'ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಇನ್ನಷ್ಟು ಭಾಷೆಗಳಿಗೆ ಬೆಂಬಲ',
    'solution.instantHelp': 'ತತ್ಕ್ಷಣ ಸಹಾಯ',
    'solution.instantHelpDesc': 'ನಿಮಗೆ ಅಗತ್ಯವಿದ್ದಾಗಲೆಲ್ಲಾ 24/7 ಸಹಾಯತೆ',
    
    // Workflow Section
    'workflow.title': 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    'workflow.subtitle': 'ನಿಮ್ಮ ಸರ್ಕಾರಿ ನಮೂನೆಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲು ಸರಳ 3-ಹಂತ ಪ್ರಕ್ರಿಯೆ',
    'workflow.step1': 'ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ಹೇಳಿ',
    'workflow.step1Desc': 'ನೀವು ಯಾವ ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ',
    'workflow.step2': 'ಕರ್ನಾಟಕ ಮಿತ್ರದೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ',
    'workflow.step2Desc': 'ನಮ್ಮ AI ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸರಳ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತದೆ',
    'workflow.step3': 'ನಿಮ್ಮ ನಮೂನೆ ಸಿದ್ಧವಾಗಿದೆ',
    'workflow.step3Desc': 'ಸಲ್ಲಿಸಲು ಸಿದ್ಧವಾಗಿರುವ ನಿಮ್ಮ ಪೂರ್ಣಗೊಂಡ ನಮೂನೆಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'workflow.ctaTitle': 'ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
    'workflow.ctaDesc': 'ನಮ್ಮ ಡೆಮೋವನ್ನು ಪ್ರಯತ್ನಿಸಿ ಮತ್ತು ಅದು ಎಷ್ಟು ಸುಲಭ ಎಂದು ನೋಡಿ',
    
    // DigiLocker Integration
    'digilocker.title': 'ಡಿಜಿಲಾಕರ್ ಸಂಯೋಜನೆ',
    'digilocker.description': 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ನೇರವಾಗಿ ಡಿಜಿಲಾಕರ್‌ನಿಂದ ಪಡೆಯಿರಿ',
    'digilocker.connect': 'ಡಿಜಿಲಾಕರ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ',
    'digilocker.connecting': 'ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
    'digilocker.connected': 'ಡಿಜಿಲಾಕರ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ',
    'digilocker.secureNote': 'ಸುರಕ್ಷಿತ OAuth 2.0 ದೃಢೀಕರಣ',
    'digilocker.fetchingDocs': 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
    'digilocker.availableDocs': 'ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳು',
    'digilocker.noDocs': 'ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    'digilocker.fetch': 'ಪಡೆಯಿರಿ',
    'digilocker.aadhaar': 'ಆಧಾರ್ ಕಾರ್ಡ್',
    'digilocker.pan': 'ಪ್ಯಾನ್ ಕಾರ್ಡ್',
    'digilocker.drivingLicense': 'ಚಾಲನಾ ಪರವಾನಗಿ',
    'digilocker.vehicleRC': 'ವಾಹನ RC',
    'digilocker.educationCert': 'ಶಿಕ್ಷಣ ಪ್ರಮಾಣಪತ್ರ',
    'digilocker.birthCert': 'ಜನನ ಪ್ರಮಾಣಪತ್ರ',
    'digilocker.connectionError': 'ಡಿಜಿಲಾಕರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ವಿಫಲವಾಗಿದೆ',
    'digilocker.tokenError': 'ಡಿಜಿಲಾಕರ್‌ನೊಂದಿಗೆ ದೃಢೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ',
    'digilocker.fetchError': 'ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ',
    'digilocker.downloadError': 'ದಾಖಲೆಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ',
    'digilocker.downloadSuccess': 'ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ!',
    
    // Footer
    'footer.title': 'ಕರ್ನಾಟಕ ಮಿತ್ರ',
    'footer.description': 'ಬುದ್ಧಿವಂತ ಸಹಾಯತೆಯೊಂದಿಗೆ ಸ್ಮಾರ್ಟ್ ಸರ್ಕಾರಿ ಸೇವೆಗಳು. ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಸುಲಭತೆಯಿಂದ ಪ್ರವೇಶಿಸಲು ಪ್ರತಿ ನಾಗರಿಕನನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು.',
    'footer.quickLinks': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    'footer.resources': 'ಸಂಪನ್ಮೂಲಗಳು',
    'footer.contact': 'ಸಂಪರ್ಕ',
    'footer.contactEmail': 'contact@karnatakmitra.gov.in',
    'footer.support': '24/7 ಬೆಂಬಲಕ್ಕಾಗಿ ಲಭ್ಯ',
    'footer.madeWithLove': 'ನಾಗರಿಕರಿಗಾಗಿ ❤️ ನೊಂದಿಗೆ ಮಾಡಲಾಗಿದೆ',
    'footer.builtWith': 'ನಿರ್ಮಿಸಲಾಗಿದೆ',
    'footer.empowerCitizens': 'ಪ್ರತಿ ನಾಗರಿಕನನ್ನು ಸಶಕ್ತಗೊಳಿಸಲು',
    'footer.copyright': '© 2024 ಕರ್ನಾಟಕ ಮಿತ್ರ. ಎಲ್ಲರಿಗೂ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಪ್ರವೇಶಿಸುವಂತೆ ಮಾಡುವುದು.',
    
    // Services Section
    'services.title': 'ಸರ್ಕಾರಿ ಸೇವೆಗಳು',
    'services.subtitle': 'ಬುದ್ಧಿವಂತ ಸಹಾಯದ ಮೂಲಕ 156+ ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಪ್ರವೇಶಿಸಿ. ಕೆಳಗಿನ 12 ಪ್ರಮುಖ ವಿಭಾಗಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ.',
    'services.cta': 'ಕರ್ನಾಟಕ ಮಿತ್ರ ಬುದ್ಧಿವಂತ ಸಹಾಯದೊಂದಿಗೆ ಎಲ್ಲಾ ಸೇವೆಗಳು 24/7 ಲಭ್ಯ',
    'services.totalServices': 'ಒಟ್ಟು ಸೇವೆಗಳು',
    'services.availability': '24/7 ಲಭ್ಯ',
    'services.languages': 'ಬಹುಭಾಷಾ ಬೆಂಬಲ',
    
    // Identity Services
    'services.identity.title': 'ಗುರುತಿನ ದಾಖಲೆಗಳು',
    'services.identity.description': 'ಅಗತ್ಯ ಗುರುತಿನ ದಾಖಲೆಗಳು ಮತ್ತು ಪರಿಶೀಲನೆ ಸೇವೆಗಳು',
    'services.identity.aadhaar': 'ಆಧಾರ್ ಕಾರ್ಡ್ ಸೇವೆಗಳು',
    'services.identity.pan': 'ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಅರ್ಜಿ',
    'services.identity.passport': 'ಪಾಸ್‌ಪೋರ್ಟ್ ಪರಿಶೀಲನೆ',
    'services.identity.voterCard': 'ಮತದಾರ ಐಡಿ ಸೇವೆಗಳು',
    
    // Financial Services
    'services.financial.title': 'ಆರ್ಥಿಕ ಲಾಭಗಳು',
    'services.financial.description': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಆರ್ಥಿಕ ಸಹಾಯ',
    'services.financial.ration': 'ರೇಷನ್ ಕಾರ್ಡ್ ಸೇವೆಗಳು',
    'services.financial.bpl': 'ಬಿಪಿಎಲ್ ಪ್ರಮಾಣಪತ್ರ',
    'services.financial.pension': 'ಪಿಂಚಣಿ ಯೋಜನೆಗಳು',
    'services.financial.scholarship': 'ಸರ್ಕಾರಿ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು',
    
    // Family Services
    'services.family.title': 'ಕುಟುಂಬ ಮತ್ತು ಸಾಮಾಜಿಕ',
    'services.family.description': 'ಕೌಟುಂಬಿಕ ಘಟನೆಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಅವಶ್ಯಕತೆಗಳಿಗಾಗಿ ಪ್ರಮಾಣಪತ್ರಗಳು',
    'services.family.birth': 'ಜನನ ಪ್ರಮಾಣಪತ್ರ',
    'services.family.death': 'ಮರಣ ಪ್ರಮಾಣಪತ್ರ',
    'services.family.marriage': 'ವಿವಾಹ ನೋಂದಣಿ',
    'services.family.caste': 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ',
    
    // Property Services
    'services.property.title': 'ಆಸ್ತಿ ಮತ್ತು ಭೂಮಿ',
    'services.property.description': 'ಭೂಮಿ ದಾಖಲೆಗಳು, ಆಸ್ತಿ ನೋಂದಣಿ ಮತ್ತು ಆದಾಯ ಸೇವೆಗಳು',
    'services.property.khata': 'ಖಾತಾ ಸೇವೆಗಳು',
    'services.property.survey': 'ಸರ್ವೆ ವಸತಿ',
    'services.property.mutation': 'ಆಸ್ತಿ ಮ್ಯುಟೇಷನ್',
    'services.property.registration': 'ಆಸ್ತಿ ನೋಂದಣಿ',
    
    // Business Services
    'services.business.title': 'ವ್ಯಾಪಾರ ಮತ್ತು ವಾಣಿಜ್ಯ',
    'services.business.description': 'ವ್ಯಾಪಾರ ಪರವಾನಗಿಗಳು, ನೋಂದಣಿಗಳು ಮತ್ತು ವಾಣಿಜ್ಯ ಸೇವೆಗಳು',
    'services.business.license': 'ವ್ಯಾಪಾರ ಪರವಾನಗಿ',
    'services.business.trade': 'ವ್ಯಾಪಾರ ಪರವಾನಗಿ',
    'services.business.gst': 'ಜಿಎಸ್‌ಟಿ ನೋಂದಣಿ',
    'services.business.msme': 'ಎಂಎಸ್‌ಎಂಇ ನೋಂದಣಿ',
    
    // Education Services
    'services.education.title': 'ಶಿಕ್ಷಣ ಸೇವೆಗಳು',
    'services.education.description': 'ಶಾಲಾ ಪ್ರವೇಶ, ವರ್ಗಾವಣೆ ಮತ್ತು ಶಿಕ್ಷಣ ಪ್ರಮಾಣಪತ್ರಗಳು',
    'services.education.admission': 'ಶಾಲಾ ಪ್ರವೇಶ',
    'services.education.transfer': 'ಶಾಲಾ ವರ್ಗಾವಣೆ',
    'services.education.scholarship': 'ಶಿಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು',
    'services.education.certificates': 'ಶಿಕ್ಷಣ ಪ್ರಮಾಣಪತ್ರಗಳು',
    
    // Health Services
    'services.health.title': 'ಆರೋಗ್ಯ ಮತ್ತು ವೈದ್ಯಕೀಯ',
    'services.health.description': 'ಆರೋಗ್ಯ ಯೋಜನೆಗಳು, ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ವಿಮೆ',
    'services.health.insurance': 'ಆರೋಗ್ಯ ವಿಮೆ',
    'services.health.ayushman': 'ಆಯುಷ್ಮಾನ್ ಭಾರತ',
    'services.health.medical': 'ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರಗಳು',
    'services.health.disability': 'ವಿಕಲಾಂಗತೆ ಪ್ರಮಾಣಪತ್ರ',
    
    // Transport Services
    'services.transport.title': 'ಸಾರಿಗೆ ಮತ್ತು ವಾಹನ',
    'services.transport.description': 'ಚಾಲನಾ ಪರವಾನಗಿ, ವಾಹನ ನೋಂದಣಿ ಮತ್ತು ಸಾರಿಗೆ ಪರವಾನಗಿಗಳು',
    'services.transport.license': 'ಚಾಲನಾ ಪರವಾನಗಿ',
    'services.transport.registration': 'ವಾಹನ ನೋಂದಣಿ',
    'services.transport.permit': 'ಸಾರಿಗೆ ಪರವಾನಗಿ',
    'services.transport.fitness': 'ವಾಹನ ಫಿಟ್‌ನೆಸ್',
    
    // Agriculture Services
    'services.agriculture.title': 'ಕೃಷಿ ಮತ್ತು ಕೃಷಿಕ',
    'services.agriculture.description': 'ರೈತ ಸಬ್ಸಿಡಿಗಳು, ಕೃಷಿ ಸಾಲಗಳು ಮತ್ತು ಭೂಮಿ ದಾಖಲೆಗಳು',
    'services.agriculture.subsidy': 'ಕೃಷಿ ಸಬ್ಸಿಡಿಗಳು',
    'services.agriculture.loan': 'ಕೃಷಿ ಸಾಲಗಳು',
    'services.agriculture.insurance': 'ಬೆಳೆ ವಿಮೆ',
    'services.agriculture.landRecord': 'ಭೂಮಿ ದಾಖಲೆಗಳು',
    
    // Utilities Services
    'services.utilities.title': 'ಉಪಯೋಗಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ',
    'services.utilities.description': 'ವಿದ್ಯುತ್, ನೀರು, ಗ್ಯಾಸ್ ಸಂಪರ್ಕಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ದೂರುಗಳು',
    'services.utilities.electricity': 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ',
    'services.utilities.water': 'ನೀರಿನ ಸಂಪರ್ಕ',
    'services.utilities.gas': 'ಗ್ಯಾಸ್ ಸಂಪರ್ಕ',
    'services.utilities.grievance': 'ಸಾರ್ವಜನಿಕ ದೂರುಗಳು',
    
    // Police Services
    'services.police.title': 'ಪೊಲೀಸ್ ಮತ್ತು ಭದ್ರತೆ',
    'services.police.description': 'ಪೊಲೀಸ್ ಪರಿಶೀಲನೆಗಳು, ಎನ್‌ಒಸಿಗಳು ಮತ್ತು ಭದ್ರತಾ ಕ್ಲಿಯರೆನ್ಸ್‌ಗಳು',
    'services.police.verification': 'ಪೊಲೀಸ್ ಪರಿಶೀಲನೆ',
    'services.police.noc': 'ಪೊಲೀಸ್ ಎನ್‌ಒಸಿ',
    'services.police.fir': 'ಆನ್‌ಲೈನ್ ಎಫ್‌ಐಆರ್',
    'services.police.passport': 'ಪಾಸ್‌ಪೋರ್ಟ್ ಪರಿಶೀಲನೆ',
    
    // Other Services
    'services.others.title': 'ಸಾಮಾನ್ಯ ಸೇವೆಗಳು',
    'services.others.description': 'ಆರ್‌ಟಿಐ, ದೂರುಗಳು, ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ವಿವಿಧ ಸೇವೆಗಳು',
    'services.others.grievance': 'ದೂರು ನಿವಾರಣೆ',
    'services.others.rti': 'ಆರ್‌ಟಿಐ ಅರ್ಜಿಗಳು',
    'services.others.complaint': 'ಆನ್‌ಲೈನ್ ದೂರುಗಳು',
    'services.others.feedback': 'ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ',

    // Demo Page
    'demo.title': 'ಕರ್ನಾಟಕ ಮಿತ್ರ ಡೆಮೋ',
    'demo.backToHome': 'ಮುಖ್ಯಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    'demo.assistant': 'ಕರ್ನಾಟಕ ಮಿತ್ರ ಸಹಾಯಕ',
    'demo.step1': 'ಹಂತ 1: ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ಹೇಳಿ',
    'demo.step2': 'ಹಂತ 2: ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ',
    'demo.step3': 'ಹಂತ 3: ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'demo.typeMessage': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
    'demo.send': 'ಕಳುಹಿಸಿ',
    'demo.downloadForm': 'ಪೂರ್ಣಗೊಂಡ ನಮೂನೆಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'demo.congratulations': '🎉 ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಸರ್ಕಾರಿ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಲು ನೀವು ಕರ್ನಾಟಕ ಮಿತ್ರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬಳಸಿದ್ದೀರಿ.',
    'demo.backHome': 'ಮುಖ್ಯಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    'demo.greeting': 'ನಮಸ್ಕಾರ! ನಾನು ಕರ್ನಾಟಕ ಮಿತ್ರ, ನಿಮ್ಮ ಸರ್ಕಾರಿ ನಮೂನೆಗಳ ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಸುಲಭವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನೀವು ಯಾವುದಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೀರಿ?'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
