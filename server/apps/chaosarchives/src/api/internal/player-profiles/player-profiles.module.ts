import { Module } from '@nestjs/common';
import { PlayerProfilesService } from './player-profiles.service';
import { PlayerProfilesController } from './player-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character, User } from '@app/entity';

@Module({
  imports: [
		TypeOrmModule.forFeature([
			Character,
			User,
		]),
	],
  controllers: [PlayerProfilesController],
  providers: [PlayerProfilesService],
})
export class PlayerProfilesModule {}
