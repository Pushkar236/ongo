import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ProjectStatus, ProjectType } from "@ongo/db";

export class CreateProjectDto {
  @ApiProperty({ example: "Acme Clinic Booking" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProjectType, required: false })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
