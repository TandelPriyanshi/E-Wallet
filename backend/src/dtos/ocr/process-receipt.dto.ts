import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ProcessReceiptDto {
  constructor() {
    this.imageUrl = '';
  }

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}
