import { IsNumber, IsOptional, IsString } from "class-validator";
import { OAuthAppSaveDto } from "./oauth-app-save.dto";

export class OAuthAppDto extends OAuthAppSaveDto {
  @IsNumber()
  id: number;

  @IsNumber()
  createdAt: number;

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string | null;

  @IsNumber()
  @IsOptional()
  blockedAt: number | null;

  @IsString()
  @IsOptional()
  blockReason: string | null;

  @IsString()
  @IsOptional()
  iconUrl: string | null;

  constructor(properties?: Readonly<OAuthAppDto>) {
    super();

    if (properties) {
      Object.assign(this, properties);
    }
  }
}
