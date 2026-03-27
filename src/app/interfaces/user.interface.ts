export interface User {
    id_user: number;
    name: string;
    last_name: string;
    ci: number;
    expiration_date: Date;
    is_active: boolean;
    role: string;
}