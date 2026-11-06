import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_STUDY_SET_TITLE_LENGTH } from '../study-set.constants';

export class UpdateStudySetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_STUDY_SET_TITLE_LENGTH)
  title!: string;
}
