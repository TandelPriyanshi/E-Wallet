import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class ShareBillDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  sharedWithEmail!: string;

  @IsOptional()
  @IsString({ message: 'Permission level must be a string' })
  permissionLevel?: string; // defaults to 'view'
}

export class UpdateSharedBillDto {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Permission level must be a string' })
  permissionLevel?: string;
}

export class SharedBillsQueryDto {
  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  type?: 'shared_by_me' | 'shared_with_me'; // filter type
}
