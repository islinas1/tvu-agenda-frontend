export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id_user: number;
    name: string;
    role_id: number;
  };
  role: 'admin' | 'usuario';
  redirect: string;
}