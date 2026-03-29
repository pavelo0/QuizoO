/**
 * Общие контракты ответов и ошибок HTTP API.
 * Согласуйте поля с бэкендом (Nest DTO / interceptors), когда появятся эндпоинты.
 */

/** Успешное тело ответа с единственным полезным payload */
export interface ApiResponse<T> {
  data: T;
}

/** Ошибка в формате, который фронт парсит из axios / fetch */
export interface ApiErrorBody {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

/** Постраничная выдача списков */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
