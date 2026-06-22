export type EntityId = string;
export type ISODateString = string;

export interface TimestampedEntity {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
