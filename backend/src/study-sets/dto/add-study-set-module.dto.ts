import { IsNotEmpty, IsString } from 'class-validator';

export class AddStudySetModuleDto {
  @IsString()
  @IsNotEmpty()
  moduleId!: string;
}
