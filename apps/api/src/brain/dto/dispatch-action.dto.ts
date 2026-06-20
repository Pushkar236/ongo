import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class DispatchActionDto {
  @ApiProperty({
    example: "cuid-of-agent",
    description: "The agent emitting this action request.",
  })
  @IsString()
  agentId!: string;

  @ApiProperty({
    example: "deploy.production",
    description:
      "Action type. Classified by the Brain's approval policy (deny-by-default for unknown types).",
  })
  @IsString()
  actionType!: string;

  @ApiProperty({ required: false, type: Object, default: {} })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiProperty({ required: false, example: "Promote v2 build to production" })
  @IsOptional()
  @IsString()
  title?: string;
}
