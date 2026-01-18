// ===========================================
// Translations for English and Spanish
// ===========================================

export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Header
    backToHome: 'Back to home',
    joinStudyGroup: "Join Professor Brambila's Contracting Classes Group",

    // Success screen
    welcomeAboard: 'Welcome Aboard!',
    nowPartOf: "You're now part of the Contractor License Study System",
    goToLogin: 'Go to Login',
    whatsNext: "What's Next?",
    hereWhatToExpect: "Here's what to expect",
    checkEmail: 'Check your email for a welcome message',
    firstChallenge: 'Your first daily challenge arrives soon',
    mobileApp: 'Mobile app coming soon',

    // Form sections
    personalInfo: 'Personal Information',
    studyTrack: 'Study Track',

    // Form fields
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Smith',
    emailAddress: 'Email Address',
    emailPlaceholder: 'john@example.com',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '(555) 123-4567',

    // License selection
    whichLicenses: 'Which license(s) are you preparing for?',
    selectAtLeastOne: 'Select at least one license',
    generalLicenses: 'General Licenses',
    specialtyLicenses: 'Specialty Licenses (Class C)',
    showAllSpecialty: 'Show all specialty licenses',
    hideSpecialtyLicenses: 'Hide specialty licenses',
    selectedLicenses: 'selected',

    // Contact preferences
    howReachYou: 'How should we reach you?',
    emailOnly: 'Email only',
    smsOnly: 'SMS only',
    both: 'Both',

    // Referral
    howHearAboutUs: 'How did you hear about us?',
    optional: '(optional)',
    selectOption: 'Select an option',
    instructorReferral: 'Instructor referral',
    classmate: 'Classmate',
    qrCodeFlyer: 'QR code/flyer',
    socialMedia: 'Social media',
    other: 'Other',

    // Errors
    registrationError: 'Registration Error',
    nameMinLength: 'Name must be at least 2 characters',
    validEmail: 'Please enter a valid email',
    validPhone: 'Please enter a valid phone number',
    selectLicense: 'Please select at least one license',

    // Submit
    creatingAccount: 'Creating your account...',
    joinStudyGroupBtn: 'Join Study Group',

    // Footer
    agreeToReceive: 'By registering, you agree to receive study-related notifications via your preferred contact method. You can unsubscribe at any time.',

    // Language toggle
    language: 'Language',
  },
  es: {
    // Header
    backToHome: 'Volver al inicio',
    joinStudyGroup: 'Unete al Grupo de Clases de Contratistas del Profesor Brambila',

    // Success screen
    welcomeAboard: 'Bienvenido!',
    nowPartOf: 'Ahora eres parte del Sistema de Estudio para Licencias de Contratista',
    goToLogin: 'Ir al Inicio de Sesion',
    whatsNext: 'Que sigue?',
    hereWhatToExpect: 'Esto es lo que puedes esperar',
    checkEmail: 'Revisa tu correo para un mensaje de bienvenida',
    firstChallenge: 'Tu primer desafio diario llegara pronto',
    mobileApp: 'Aplicacion movil proximamente',

    // Form sections
    personalInfo: 'Informacion Personal',
    studyTrack: 'Tipo de Licencia',

    // Form fields
    fullName: 'Nombre Completo',
    fullNamePlaceholder: 'Juan Perez',
    emailAddress: 'Correo Electronico',
    emailPlaceholder: 'juan@ejemplo.com',
    phoneNumber: 'Numero de Telefono',
    phonePlaceholder: '(555) 123-4567',

    // License selection
    whichLicenses: 'Para cual(es) licencia(s) te estas preparando?',
    selectAtLeastOne: 'Selecciona al menos una licencia',
    generalLicenses: 'Licencias Generales',
    specialtyLicenses: 'Licencias de Especialidad (Clase C)',
    showAllSpecialty: 'Mostrar todas las licencias de especialidad',
    hideSpecialtyLicenses: 'Ocultar licencias de especialidad',
    selectedLicenses: 'seleccionadas',

    // Contact preferences
    howReachYou: 'Como prefieres que te contactemos?',
    emailOnly: 'Solo correo',
    smsOnly: 'Solo SMS',
    both: 'Ambos',

    // Referral
    howHearAboutUs: 'Como te enteraste de nosotros?',
    optional: '(opcional)',
    selectOption: 'Selecciona una opcion',
    instructorReferral: 'Referido por instructor',
    classmate: 'Companero de clase',
    qrCodeFlyer: 'Codigo QR/volante',
    socialMedia: 'Redes sociales',
    other: 'Otro',

    // Errors
    registrationError: 'Error de Registro',
    nameMinLength: 'El nombre debe tener al menos 2 caracteres',
    validEmail: 'Por favor ingresa un correo valido',
    validPhone: 'Por favor ingresa un numero de telefono valido',
    selectLicense: 'Por favor selecciona al menos una licencia',

    // Submit
    creatingAccount: 'Creando tu cuenta...',
    joinStudyGroupBtn: 'Unirse al Grupo de Estudio',

    // Footer
    agreeToReceive: 'Al registrarte, aceptas recibir notificaciones relacionadas con el estudio a traves de tu metodo de contacto preferido. Puedes cancelar en cualquier momento.',

    // Language toggle
    language: 'Idioma',
  },
} as const;

// California Contractor License Types
export interface LicenseOption {
  code: string;
  nameEn: string;
  nameEs: string;
  category: 'general' | 'specialty';
}

export const LICENSE_OPTIONS: LicenseOption[] = [
  // General Licenses
  { code: 'A', nameEn: 'General Engineering', nameEs: 'Ingenieria General', category: 'general' },
  { code: 'B', nameEn: 'General Building', nameEs: 'Construccion General', category: 'general' },

  // Specialty Licenses (Class C)
  { code: 'C-2', nameEn: 'Insulation and Acoustical', nameEs: 'Aislamiento y Acustica', category: 'specialty' },
  { code: 'C-4', nameEn: 'Boiler, Hot Water Heating and Steam Fitting', nameEs: 'Calderas, Calefaccion y Vapor', category: 'specialty' },
  { code: 'C-5', nameEn: 'Framing and Rough Carpentry', nameEs: 'Estructuras y Carpinteria Basica', category: 'specialty' },
  { code: 'C-6', nameEn: 'Cabinet, Millwork and Finish Carpentry', nameEs: 'Gabinetes y Carpinteria Fina', category: 'specialty' },
  { code: 'C-7', nameEn: 'Low Voltage Systems', nameEs: 'Sistemas de Bajo Voltaje', category: 'specialty' },
  { code: 'C-8', nameEn: 'Concrete', nameEs: 'Concreto', category: 'specialty' },
  { code: 'C-9', nameEn: 'Drywall', nameEs: 'Tablaroca', category: 'specialty' },
  { code: 'C-10', nameEn: 'Electrical', nameEs: 'Electricidad', category: 'specialty' },
  { code: 'C-11', nameEn: 'Elevator', nameEs: 'Elevadores', category: 'specialty' },
  { code: 'C-12', nameEn: 'Earthwork and Paving', nameEs: 'Movimiento de Tierras y Pavimentacion', category: 'specialty' },
  { code: 'C-13', nameEn: 'Fencing', nameEs: 'Cercas', category: 'specialty' },
  { code: 'C-15', nameEn: 'Flooring and Floor Covering', nameEs: 'Pisos y Recubrimientos', category: 'specialty' },
  { code: 'C-16', nameEn: 'Fire Protection', nameEs: 'Proteccion contra Incendios', category: 'specialty' },
  { code: 'C-17', nameEn: 'Glazing', nameEs: 'Vidrieria', category: 'specialty' },
  { code: 'C-20', nameEn: 'HVAC (Warm-Air Heating, Ventilating, Air-Conditioning)', nameEs: 'HVAC (Calefaccion, Ventilacion, Aire Acondicionado)', category: 'specialty' },
  { code: 'C-21', nameEn: 'Building Moving/Demolition', nameEs: 'Movimiento/Demolicion de Edificios', category: 'specialty' },
  { code: 'C-22', nameEn: 'Asbestos Abatement', nameEs: 'Remocion de Asbesto', category: 'specialty' },
  { code: 'C-23', nameEn: 'Ornamental Metal', nameEs: 'Metal Ornamental', category: 'specialty' },
  { code: 'C-27', nameEn: 'Landscaping', nameEs: 'Paisajismo', category: 'specialty' },
  { code: 'C-28', nameEn: 'Lock and Security Equipment', nameEs: 'Cerrajeria y Equipo de Seguridad', category: 'specialty' },
  { code: 'C-29', nameEn: 'Masonry', nameEs: 'Albanileria', category: 'specialty' },
  { code: 'C-31', nameEn: 'Construction Zone Traffic Control', nameEs: 'Control de Trafico en Zonas de Construccion', category: 'specialty' },
  { code: 'C-32', nameEn: 'Parking and Highway Improvement', nameEs: 'Estacionamientos y Mejoras de Carreteras', category: 'specialty' },
  { code: 'C-33', nameEn: 'Painting and Decorating', nameEs: 'Pintura y Decoracion', category: 'specialty' },
  { code: 'C-34', nameEn: 'Pipeline', nameEs: 'Tuberias', category: 'specialty' },
  { code: 'C-35', nameEn: 'Lathing and Plastering', nameEs: 'Enlistonado y Enyesado', category: 'specialty' },
  { code: 'C-36', nameEn: 'Plumbing', nameEs: 'Plomeria', category: 'specialty' },
  { code: 'C-38', nameEn: 'Refrigeration', nameEs: 'Refrigeracion', category: 'specialty' },
  { code: 'C-39', nameEn: 'Roofing', nameEs: 'Techado', category: 'specialty' },
  { code: 'C-42', nameEn: 'Sanitation System', nameEs: 'Sistema de Saneamiento', category: 'specialty' },
  { code: 'C-43', nameEn: 'Sheet Metal', nameEs: 'Lamina de Metal', category: 'specialty' },
  { code: 'C-45', nameEn: 'Signs', nameEs: 'Letreros', category: 'specialty' },
  { code: 'C-46', nameEn: 'Solar', nameEs: 'Solar', category: 'specialty' },
  { code: 'C-47', nameEn: 'General Manufactured Housing', nameEs: 'Viviendas Prefabricadas', category: 'specialty' },
  { code: 'C-50', nameEn: 'Reinforcing Steel', nameEs: 'Acero de Refuerzo', category: 'specialty' },
  { code: 'C-51', nameEn: 'Structural Steel', nameEs: 'Acero Estructural', category: 'specialty' },
  { code: 'C-53', nameEn: 'Swimming Pool', nameEs: 'Piscinas', category: 'specialty' },
  { code: 'C-54', nameEn: 'Ceramic and Mosaic Tile', nameEs: 'Azulejo Ceramico y Mosaico', category: 'specialty' },
  { code: 'C-55', nameEn: 'Water Conditioning', nameEs: 'Tratamiento de Agua', category: 'specialty' },
  { code: 'C-57', nameEn: 'Well Drilling', nameEs: 'Perforacion de Pozos', category: 'specialty' },
  { code: 'C-60', nameEn: 'Welding', nameEs: 'Soldadura', category: 'specialty' },
  { code: 'C-61', nameEn: 'Limited Specialty', nameEs: 'Especialidad Limitada', category: 'specialty' },
];

export const getGeneralLicenses = () => LICENSE_OPTIONS.filter(l => l.category === 'general');
export const getSpecialtyLicenses = () => LICENSE_OPTIONS.filter(l => l.category === 'specialty');

export function useTranslation(language: Language) {
  const t = translations[language];

  const getLicenseName = (license: LicenseOption) => {
    return language === 'en' ? license.nameEn : license.nameEs;
  };

  return { t, getLicenseName };
}
