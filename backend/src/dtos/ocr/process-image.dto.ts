import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProcessImageDto {
  constructor() {
    this.imagePath = '';
  }

  @IsString()
  @IsNotEmpty()
  imagePath: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}
