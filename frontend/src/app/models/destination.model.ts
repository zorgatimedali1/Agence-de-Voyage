export interface Destination {
  _id?: string;
  nom: string;
  pays: string;
  description?: string;
  image?: string;
  climat?: 'tropical' | 'désertique' | 'méditerranéen' | 'continental' | 'polaire' | 'tempéré';
  langueLocale?: string;
  monnaie?: string;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
