import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { AddStudySetModuleDto } from './dto/add-study-set-module.dto';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { StudySetsService } from './study-sets.service';

@Controller('study-sets')
export class StudySetsController {
  constructor(private readonly studySets: StudySetsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.studySets.list(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: string, @Body() body: CreateStudySetDto) {
    return this.studySets.create(userId, body);
  }

  @Get('statistics')
  statistics(@CurrentUserId() userId: string) {
    return this.studySets.statistics(userId);
  }

  @Get(':setId')
  getOne(@CurrentUserId() userId: string, @Param('setId') setId: string) {
    return this.studySets.getOne(userId, setId);
  }

  @Patch(':setId')
  rename(
    @CurrentUserId() userId: string,
    @Param('setId') setId: string,
    @Body() body: UpdateStudySetDto,
  ) {
    return this.studySets.rename(userId, setId, body);
  }

  @Delete(':setId')
  remove(@CurrentUserId() userId: string, @Param('setId') setId: string) {
    return this.studySets.remove(userId, setId);
  }

  @Post(':setId/modules')
  @HttpCode(HttpStatus.OK)
  addModule(
    @CurrentUserId() userId: string,
    @Param('setId') setId: string,
    @Body() body: AddStudySetModuleDto,
  ) {
    return this.studySets.addModule(userId, setId, body);
  }

  @Delete(':setId/modules/:moduleId')
  removeModule(
    @CurrentUserId() userId: string,
    @Param('setId') setId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.studySets.removeModule(userId, setId, moduleId);
  }
}
