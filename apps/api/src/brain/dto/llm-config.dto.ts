import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

/** Live LLM provider config; persisted to Settings and applied immediately. */
export class LlmConfigDto {
  @ApiPropertyOptional({ example: "openrouter" })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ example: "https://openrouter.ai/api/v1" })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: "Provider API key (stored in DB)." })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ example: "cohere/north-mini-code:free" })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: "Chain slot: '' (primary), '_2', '_3', '_4'.",
    enum: ["", "_2", "_3", "_4"],
  })
  @IsOptional()
  @IsIn(["", "_2", "_3", "_4"])
  slot?: string;
}
