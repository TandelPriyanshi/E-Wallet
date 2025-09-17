import { IsString, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class UpdateBillDto {
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  productName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Warranty period must be a number' })
  @Min(1, { message: 'Warranty period must be at least 1 month' })
  @Max(120, { message: 'Warranty period cannot exceed 120 months' })
  warrantyPeriod?: number;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export class SearchBillDto {
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  productName?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string;
}
