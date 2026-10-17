import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import enTranslations from "../locales/en.json";
import taTranslations from "../locales/ta.json";
import {
  getTranslatedProductName,
  getTranslatedCategoryName,
} from "@repo/crackers";

export type Language = "en" | "ta";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  tProduct: (codeOrName?: string | null, fallback?: string) => string;
  tCategory: (slugOrName?: string | null, fallback?: string) => string;
  isTamil: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "santhi_language";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved === "ta" || saved === "en") {
        return saved;
      }
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, "ta");
    } catch {
      // ignore
    }
    return "ta";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === "ta") {
      document.body.classList.add("lang-ta");
    } else {
      document.body.classList.remove("lang-ta");
    }
  }, [language]);

  const translations = useMemo(() => {
    return language === "ta"
      ? (taTranslations as Record<string, string>)
      : (enTranslations as Record<string, string>);
  }, [language]);

  const fallbackTranslations = useMemo(() => {
    return enTranslations as Record<string, string>;
  }, []);

  const tProduct = useMemo(() => {
    return (codeOrName?: string | null, fallback?: string): string => {
      return getTranslatedProductName(codeOrName, language, fallback);
    };
  }, [language]);

  const tCategory = useMemo(() => {
    return (slugOrName?: string | null, fallback?: string): string => {
      return getTranslatedCategoryName(slugOrName, language, fallback);
    };
  }, [language]);

  const t = useMemo(() => {
    return (key: string, variables?: Record<string, string | number>): string => {
      if (!key) return "";

      let raw = translations[key];
      if (raw === undefined) {
        raw = fallbackTranslations[key];
      }
      if (raw === undefined) {
        const trimmed = key.trim();
        if (translations[trimmed] !== undefined) {
          raw = translations[trimmed];
        } else if (fallbackTranslations[trimmed] !== undefined) {
          raw = fallbackTranslations[trimmed];
        }
      }
      // Check crackers product or category translation from @repo/crackers
      if (raw === undefined) {
        const prodTranslation = getTranslatedProductName(key, language);
        if (prodTranslation && prodTranslation.toLowerCase() !== key.toLowerCase()) {
          raw = prodTranslation;
        } else {
          const catTranslation = getTranslatedCategoryName(key, language);
          if (catTranslation && catTranslation.toLowerCase() !== key.toLowerCase()) {
            raw = catTranslation;
          }
        }
      }
      if (raw === undefined) {
        raw = key;
      }

      if (variables) {
        let interpolated = raw;
        for (const [varKey, varVal] of Object.entries(variables)) {
          interpolated = interpolated.split(`{${varKey}}`).join(String(varVal));
        }
        return interpolated;
      }

      return raw;
    };
  }, [translations, fallbackTranslations, language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      tProduct,
      tCategory,
      isTamil: language === "ta",
    }),
    [language, t, tProduct, tCategory],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
