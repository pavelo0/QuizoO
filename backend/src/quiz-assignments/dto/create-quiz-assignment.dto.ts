import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateQuizAssignmentDto {
  @IsString()
  @IsNotEmpty()
  moduleId!: string;

  @IsISO8601()
  deadline!: string;
}
