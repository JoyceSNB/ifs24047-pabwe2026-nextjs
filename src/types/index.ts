// Bentuk respons standar Delcom Open API.
export interface ApiResult<T = unknown> {
  status?: string;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostAuthor {
  name: string;
  photo: string | null;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

// likes = daftar id pengguna yang menyukai. Pada daftar postingan, comments berisi
// id pengguna; pada detail postingan, comments berisi objek komentar lengkap.
export interface Post {
  id: number;
  user_id: number;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  likes: number[];
  comments: Array<number | PostComment>;
  my_comment?: PostComment | null;
}