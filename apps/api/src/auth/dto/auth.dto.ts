import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

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
  // NOTE: no `role` here on purpose — self-registration must never let a
  // caller choose its own role. Public sign-ups are always OPERATOR; elevation
  // is a privileged, server-side action.
}

export class ChangePasswordDto {
  @ApiProperty({ example: "OnGoFounder!2026" })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: "my-new-strong-passphrase" })
  @IsString()
  @MinLength(10)
  newPassword!: string;
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
