import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { CommunityTag } from './community-tag.entity';
import { Image } from './image.entity';
import { Server } from './server.entity';

@Entity()
@Unique(['name', 'server'])
export class Community extends BasicEntity {
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
	discord: string;

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
    default: ''
  })
	areaOfOperations: string;

  @Column({
    nullable: false,
    default: ''
  })
	recruitingOfficers: string;

  @Column({
    nullable: false,
    width: 100,
    default: ''
  })
	carrdProfile: string;

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image|null>;

  @OneToMany(() => CommunityTag, tag => tag.community, {
    cascade: true,
  })
	tags: CommunityTag[]
}
