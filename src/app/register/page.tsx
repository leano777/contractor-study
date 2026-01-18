'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, ArrowLeft, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  Language,
  translations,
  LICENSE_OPTIONS,
  getGeneralLicenses,
  getSpecialtyLicenses,
} from '@/lib/translations';

// ===========================================
// PHASE 1: QUICK WIN - Student Registration
// ===========================================
// This form collects student info and stores it.
// Works in demo mode (localStorage) or with Supabase.

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?1?\d{10,14}$/, 'Please enter a valid phone number'),
  licenses: z.array(z.string()).min(1, 'Please select at least one license'),
  preferredContact: z.enum(['email', 'sms', 'both']),
  referralSource: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

// Format phone number as user types: (555) 123-4567
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
}

// Loading fallback for Suspense
function RegisterFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-blue-50/30 to-white py-12">
      <div className="card max-w-2xl w-full shadow-xl overflow-hidden animate-pulse">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-8 pb-6 h-32" />
        <div className="p-8 space-y-6">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}

// The actual form component that uses useSearchParams
function RegisterForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [showSpecialty, setShowSpecialty] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];
  const generalLicenses = getGeneralLicenses();
  const specialtyLicenses = getSpecialtyLicenses();

  // Read UTM params from URL
  const utmSource = searchParams.get('utm_source') || undefined;
  const utmMedium = searchParams.get('utm_medium') || undefined;
  const utmCampaign = searchParams.get('utm_campaign') || undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      preferredContact: 'both',
      licenses: [],
    },
  });

  const selectedLicenses = watch('licenses') || [];

  // Handle phone number formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneDisplay(formatted);
    // Store raw digits for validation
    const rawDigits = formatted.replace(/\D/g, '');
    setValue('phone', rawDigits, { shouldValidate: true });
  };

  // Handle license checkbox change
  const handleLicenseChange = (code: string, checked: boolean) => {
    const current = selectedLicenses;
    if (checked) {
      setValue('licenses', [...current, code], { shouldValidate: true });
    } else {
      setValue('licenses', current.filter(l => l !== code), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Include UTM params from URL in the request
      const payload = {
        ...data,
        utmSource,
        utmMedium,
        utmCampaign,
        language,
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLicenseName = (license: { code: string; nameEn: string; nameEs: string }) => {
    return language === 'en' ? license.nameEn : license.nameEs;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-success-50 via-primary-50 to-white dark:bg-gradient-to-br dark:from-success-50 dark:via-primary-50 dark:to-white">
        <div className="card max-w-sm w-full overflow-hidden animate-fade-in shadow-lg dark:bg-white dark:border-gray-200">
          <div className="relative bg-gradient-to-br from-success-500 to-success-600 px-6 py-8 text-white text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="text-xl font-bold mb-1">{t.welcomeAboard}</h1>
            <p className="text-success-100 text-sm">{t.nowPartOf}</p>
          </div>
          <div className="p-4">
            <Link
              href="/login"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {t.goToLogin}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-blue-50/30 to-white py-12 dark:bg-gradient-to-br dark:from-primary-50 dark:via-blue-50/30 dark:to-white">
      <div className="card max-w-2xl w-full shadow-xl overflow-hidden animate-fade-in dark:bg-white dark:border-gray-200">
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-8 pb-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

          <div className="relative">
            {/* Language Toggle & Back */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center text-sm text-primary-100 hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                {t.backToHome}
              </Link>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === 'es'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  ES
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.joinStudyGroup}</h1>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 [&_.input]:dark:bg-white [&_.input]:dark:border-gray-300 [&_.input]:dark:text-gray-900 [&_.input]:dark:placeholder:text-gray-400 [&_.label]:dark:text-gray-700">
          {/* Personal Information Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-300"></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-500">{t.personalInfo}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-300"></div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="label block mb-2">
                {t.fullName}
              </label>
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                className="input transition-all hover:shadow-sm focus:shadow-md"
                placeholder={t.fullNamePlaceholder}
              />
              {errors.fullName && (
                <p className="text-sm text-danger-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {language === 'en' ? errors.fullName.message : t.nameMinLength}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label block mb-2">
                {t.emailAddress}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="input pl-11 transition-all hover:shadow-sm focus:shadow-md"
                  placeholder={t.emailPlaceholder}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-danger-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {language === 'en' ? errors.email.message : t.validEmail}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label block mb-2">
                {t.phoneNumber}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phone"
                  className="input pl-11 transition-all hover:shadow-sm focus:shadow-md"
                  placeholder={t.phonePlaceholder}
                  value={phoneDisplay}
                  onChange={handlePhoneChange}
                />
                <input type="hidden" {...register('phone')} />
              </div>
              {errors.phone && (
                <p className="text-sm text-danger-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {language === 'en' ? errors.phone.message : t.validPhone}
                </p>
              )}
            </div>
          </div>

          {/* License Selection Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-300"></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-500">{t.studyTrack}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-300"></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label">{t.whichLicenses}</label>
                {selectedLicenses.length > 0 && (
                  <span className="text-sm text-primary-600 font-medium">
                    {selectedLicenses.length} {t.selectedLicenses}
                  </span>
                )}
              </div>

              {/* General Licenses */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-3">{t.generalLicenses}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generalLicenses.map((license) => {
                    const isSelected = selectedLicenses.includes(license.code);
                    return (
                      <label
                        key={license.code}
                        className="relative cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleLicenseChange(license.code, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`flex items-center gap-3 p-4 border-2 rounded-xl bg-white transition-all hover:border-primary-300 hover:shadow-md dark:bg-white ${
                          isSelected ? 'border-primary-500 bg-primary-50 shadow-lg dark:bg-primary-50' : 'border-gray-200 dark:border-gray-200'
                        }`}>
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 bg-white dark:border-gray-300 dark:bg-white'
                          }`}>
                            <svg className={`w-4 h-4 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 block dark:text-gray-900">{language === 'en' ? 'Class' : 'Clase'} {license.code}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-500">{getLicenseName(license)}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Specialty Licenses Toggle */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden dark:border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSpecialty(!showSpecialty)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-50 dark:hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-700">{t.specialtyLicenses}</span>
                    {selectedLicenses.filter(l => l.startsWith('C-')).length > 0 && (
                      <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {selectedLicenses.filter(l => l.startsWith('C-')).length} {t.selectedLicenses}
                      </span>
                    )}
                  </div>
                  {showSpecialty ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {showSpecialty && (
                  <div className="p-4 border-t border-gray-200 bg-white dark:border-gray-200 dark:bg-white">
                    <p className="text-sm text-gray-500 mb-4 dark:text-gray-500">
                      {t.showAllSpecialty}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
                      {specialtyLicenses.map((license) => {
                        const isSelected = selectedLicenses.includes(license.code);
                        return (
                          <label
                            key={license.code}
                            className="relative cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleLicenseChange(license.code, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`flex items-center gap-2 p-3 border rounded-lg transition-all hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-50 ${
                              isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-50' : 'border-gray-200 bg-white dark:border-gray-200 dark:bg-white'
                            }`}>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 bg-white dark:border-gray-300 dark:bg-white'
                              }`}>
                                <svg className={`w-3 h-3 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm dark:text-gray-900">{license.code}</span>
                                <span className="text-xs text-gray-500 block truncate dark:text-gray-500">{getLicenseName(license)}</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {errors.licenses && (
                <p className="text-sm text-danger-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t.selectLicense}
                </p>
              )}
            </div>
          </div>

          {/* Preferred Contact */}
          <div>
            <label className="label block mb-3">{t.howReachYou}</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { value: 'email', label: t.emailOnly, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { value: 'sms', label: t.smsOnly, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                { value: 'both', label: t.both, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              ].map((option) => {
                const selectedContact = watch('preferredContact');
                const isSelected = selectedContact === option.value;
                return (
                  <label key={option.value} className="relative flex-1 cursor-pointer group">
                    <input
                      {...register('preferredContact')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition-all hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-50 ${
                      isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-50' : 'border-gray-200 bg-white dark:border-gray-200 dark:bg-white'
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-100 dark:text-gray-600'
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary-900 dark:text-primary-900' : 'text-gray-700 dark:text-gray-700'}`}>{option.label}</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 bg-white dark:border-gray-300 dark:bg-white'
                      }`}>
                        <svg className={`w-3 h-3 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Referral Source */}
          <div className="pt-2">
            <label htmlFor="referralSource" className="label block mb-2">
              {t.howHearAboutUs} <span className="text-gray-400 font-normal">{t.optional}</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select {...register('referralSource')} id="referralSource" className="input pl-11 transition-all hover:shadow-sm focus:shadow-md">
                <option value="">{t.selectOption}</option>
                <option value="instructor">{t.instructorReferral}</option>
                <option value="classmate">{t.classmate}</option>
                <option value="qr_code">{t.qrCodeFlyer}</option>
                <option value="social_media">{t.socialMedia}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-xl p-4 text-sm flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium mb-1">{t.registrationError}</p>
                <p className="text-danger-600">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-base font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.creatingAccount}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t.joinStudyGroupBtn}
              </>
            )}
          </button>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-50 dark:border-gray-200">
            <p className="text-xs text-gray-600 text-center leading-relaxed dark:text-gray-600">
              {t.agreeToReceive}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
