import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class AutonomyConfigDto {
  @ApiPropertyOptional({
    description: "Cycle interval in milliseconds (min 15000). Persists across redeploys.",
    example: 300000,
  })
  @IsOptional()
  @IsInt()
  @Min(15000)
  intervalMs?: number;

  @ApiPropertyOptional({
    description: "Max number of auto-incubated projects (0-50). Persists.",
    example: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  incubatorMax?: number;

  @ApiPropertyOptional({
    description:
      "Master switch for autonomous code-writing (incubation + dev loop). " +
      "false = curation-only mode (default). Persists.",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  buildEnabled?: boolean;
}
