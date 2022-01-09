import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { Image } from './image.entity';
import { Server } from './server.entity';

@Entity()
@Unique(['name', 'server'])
export class FreeCompany extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    unique: true
  })
  lodestoneId: string;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
    length: 5,
  })
  tag: string;

  @Column({
    type: 'text',
    nullable: false,
    default: ''
  })
  crest: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @Column({
    nullable: true
  })
  claimedAt: Date;

  @ManyToOne(() => Character, {
    nullable: true,
  })
  leader: Character|null;

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
	goal: string;

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

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image>;

  getCrest(): string[] {
    return this.crest.split(',');
  }
}
