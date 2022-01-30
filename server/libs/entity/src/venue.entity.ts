import { HousingArea } from '@app/shared/enums/housing-area.enum';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { Image } from './image.entity';
import { Server } from './server.entity';
import { VenueTag } from './venue-tag.entity';

@Entity()
@Unique(['name', 'server'])
export class Venue extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  owner: Character;

  @Column({
    type: 'date',
    nullable: true
  })
  foundedAt: string|null;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: ''
  })
  description: string;

  @Column({
    nullable: false,
    default: ''
  })
	website: string;

  @Column({
    nullable: false,
    default: ''
  })
	purpose: string;

  @Column({
    nullable: false,
    default: ''
  })
	status: string;

  @Column({
    nullable: false,
    width: 100,
    default: ''
  })
	carrdProfile: string;

  @Column({
    type: 'enum',
    enum: VenueLocation,
    nullable: false,
  })
	location: VenueLocation;

  @Column({
    nullable: false,
    default: ''
  })
	address: string;

  @Column({
    type: 'enum',
    enum: HousingArea,
    nullable: true,
  })
	housingArea: HousingArea|null;

  @Column({
    type: 'integer',
    nullable: true,
  })
	ward: number|null;

  @Column({
    type: 'integer',
    nullable: true,
  })
	plot: number|null;

  @Column({
    type: 'boolean',
    nullable: true,
  })
	subdivision: boolean|null;

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image|null>;

  @OneToMany(() => VenueTag, tag => tag.venue, {
    cascade: true,
  })
	tags: VenueTag[]
}
