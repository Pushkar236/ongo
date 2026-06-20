import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { LeadType } from "@ongo/db";

export class CreateLeadDto {
  @ApiProperty({ enum: LeadType, required: false, default: LeadType.WEBSITE })
  @IsOptional()
  @IsEnum(LeadType)
  type?: LeadType;

  @ApiProperty({ example: "Acme Clinic" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string;

  @ApiProperty({ example: "owner@acme.com" })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ example: "We need a booking website for our 3 clinics." })
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message!: string;

  // Honeypot — bots fill this; humans never see it.
  @IsOptional()
  @IsString()
  company?: string;
}
