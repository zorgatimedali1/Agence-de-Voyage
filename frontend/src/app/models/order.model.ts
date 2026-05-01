import { Voyage } from './voyage.model';

export interface OrderClient {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface Order {
  _id?: string;
  voyage: string | Voyage;
  client: OrderClient;
  nombrePersonnes: number;
  prixTotal: number;
  statut: 'en_attente' | 'confirmée' | 'annulée';
  message?: string;
  createdAt?: string;
  updatedAt?: string;
}
