import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Role } from "@ongo/db";

export class RegisterDto {
  @ApiProperty({ example: "operator@ongo.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Jane Operator" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: "StrongPassw0rd!" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: Role, required: false, default: Role.OPERATOR })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class LoginDto {
  @ApiProperty({ example: "founder@ongo.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "OnGoFounder!2026" })
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
