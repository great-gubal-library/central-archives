import { ArrayNotEmpty, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { OAuthAppDto } from "./oauth-app.dto";
import { AppType } from "@app/shared/enums/oauth/app-type.enum";
import { AuthFlow } from "@app/shared/enums/oauth/auth-flow.enum";
import { AuthScope } from "@app/shared/enums/oauth/auth-scope.enum";

export class OAuthAppSaveDto {
  @IsString()
	@MinLength(1)
	name: string;

  @IsString()
	description: string;

  @IsNumber()
  @IsOptional()
  iconId: number | null;

  @IsEnum(AppType)
  type: AppType;

  @IsEnum(AuthFlow, { each: true })
  @ArrayNotEmpty()
  enabledFlows: AuthFlow[];

  @IsEnum(AuthScope, { each: true })
  @ArrayNotEmpty()
  requestableScopes: AuthScope[];

  @IsBoolean()
  active: boolean;

  @IsString({ each: true })
	redirectUris: string[];

  constructor(properties?: Readonly<OAuthAppDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
