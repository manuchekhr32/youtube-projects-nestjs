import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @ApiProperty({
    required: true,
    nullable: false,
  })
  username: string;

  @IsString()
  @ApiProperty({
    required: true,
    nullable: false,
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    nullable: true,
  })
  name?: string;
}
