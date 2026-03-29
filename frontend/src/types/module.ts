/**
 * Учебный модуль (курс / раздел с уроками или квизами).
 */

export type ModuleId = string;

export interface Module {
  id: ModuleId;
  title: string;
  description?: string;
  order: number;
  courseId?: string;
  lessonCount?: number;
  createdAt: string;
  updatedAt?: string;
}
