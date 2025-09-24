export interface User {
  id: string;
  displayName: string;
  surname: string;
  email: string;
  avatar?: string; // URL dell'avatar su Cloud Storage
}
