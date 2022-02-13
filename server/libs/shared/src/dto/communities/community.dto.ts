import { MembershipStatus } from '@app/shared/enums/membership-status.enum';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BannerDto } from '../characters/banner.dto';

export class CommunityDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsBoolean()
  @IsOptional()
  mine: boolean;

  @IsEnum(MembershipStatus)
  @IsOptional()
  membershipStatus: MembershipStatus|null;

  @IsBoolean()
  @IsOptional()
  canEdit: boolean;

  @IsBoolean()
  @IsOptional()
  canManageMembers: boolean;

	@IsString()
	owner: string;

	@IsString()
	ownerServer: string;

  @IsString()
  @IsOptional()
  foundedAt: string|null;

  @IsString()
  name: string;
	
  @IsString()
  description: string;

  @IsString()
  website: string;

  @IsString()
  discord: string;

  @IsString()
  goal: string;

  @IsString()
  status: string;

  @IsString()
	recruitingOfficers: string;

  @IsString()
  carrdProfile: string;

  @Type(() => BannerDto)
  @ValidateNested()
  @IsOptional()
  banner: BannerDto|null;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
	
	constructor(properties?: Readonly<CommunityDto>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
