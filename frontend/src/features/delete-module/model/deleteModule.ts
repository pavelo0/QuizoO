import { deleteModule } from '@/entities/module';

export async function deleteModuleById(moduleId: string) {
  await deleteModule(moduleId);
}
