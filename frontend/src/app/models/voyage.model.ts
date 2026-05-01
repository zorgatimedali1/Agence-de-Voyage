import { Destination } from './destination.model';

export interface Voyage {
  _id?: string;
  titre: string;
  destination: string | Destination;
  description?: string;
  prix: number;
  duree: number;
  dateDepart: string | Date;
  dateRetour: string | Date;
  placesDisponibles: number;
  typeVoyage?: 'aventure' | 'culturel' | 'balnéaire' | 'montagne' | 'citytrip' | 'croisière';
  image?: string;
  inclus?: string[];
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoyageResponse {
  success: boolean;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  data: Voyage | Voyage[];
  message?: string;
}

export interface VoyageFilter {
  search?: string;
  destination?: string;
  dateDepart?: string;
  type?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
