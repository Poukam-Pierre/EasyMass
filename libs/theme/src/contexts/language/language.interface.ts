export interface LanguageContextProviderProps {
  children: JSX.Element;
}

export type LanguageType = 'en' | 'fr';

export type Action = { type: 'USE_ENGLISH' } | { type: 'USE_FRENCH' };

export interface Language {
  activeLanguage: LanguageType;
  languageDispatch: React.Dispatch<Action>;
}

export type State = Language;
