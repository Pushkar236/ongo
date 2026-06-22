import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Min } from "class-validator";

export class AutonomyConfigDto {
  @ApiPropertyOptional({
    description: "Cycle interval in milliseconds (min 15000). Persists across redeploys.",
    example: 300000,
  })
  @IsOptional()
  @IsInt()
  @Min(15000)
  intervalMs?: number;
}
