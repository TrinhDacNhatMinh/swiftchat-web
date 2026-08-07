export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  nextCursor?: string; // Used for cursor-based pagination (e.g. messages)
  page?: number;       // Used for offset-based pagination
  limit?: number;
}

// --- Infinite Query cache types ---

/**
 * Một trang trong infinite query messages.
 * Backend có thể trả về data trực tiếp là mảng, hoặc wrapped trong { data: [] } hoặc { items: [] }.
 */
export type MessagePageData<T> =
  | T[]
  | { data: T[]; nextCursor?: string; [key: string]: unknown }
  | { items: T[]; nextCursor?: string; [key: string]: unknown };

/**
 * Cấu trúc data của useInfiniteQuery cho messages.
 * Dùng thay cho `any` trong các setQueryData callbacks.
 */
export interface InfiniteData<T> {
  pages: MessagePageData<T>[];
  pageParams: (string | undefined)[];
}

