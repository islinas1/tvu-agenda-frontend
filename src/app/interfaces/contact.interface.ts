export interface Phone {
  phone: string;
  is_active: boolean;
  registration_date: Date;
}

export interface Contact {
  id_contact: number;
  contact_name: string;
  contact_institution: string | null;
  contact_position: string | null;
  description: string | null;
  is_active: boolean;
  created_by: number;
  phones: Phone[];
}