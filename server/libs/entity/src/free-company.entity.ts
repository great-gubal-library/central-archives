import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { Image } from './image.entity';
import { SearchFields } from './search-fields';
import { Server } from './server.entity';

@Entity()
@Unique(['name', 'server'])
@Index(SearchFields.freeCompany, { fulltext: true })
export class FreeCompany extends BasicEntity {
  @Column({
    nullable: false,
    unique: true,
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
    default: '',
  })
  crest: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @Column({
    nullable: false,
  })
  foundedAt: Date;

  @Column({
    nullable: true,
  })
  claimedAt: Date;

  @ManyToOne(() => Character, {
    nullable: true,
  })
  leader: Character | null;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: '',
  })
  description: string;

  @Column({
    nullable: false,
    default: '',
  })
  website: string;

  @Column({
    nullable: false,
    default: '',
  })
  goal: string;

  @Column({
    nullable: false,
    default: '',
  })
  status: string;

  @Column({
    nullable: false,
    default: '',
  })
  areaOfOperations: string;

  @Column({
    nullable: false,
    default: '',
  })
  recruitingOfficers: string;

  @Column({
    nullable: false,
    width: 100,
    default: '',
  })
  carrdProfile: string;

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image | null>;

  getCrest(): string[] {
    return this.crest.split(',');
  }
}
