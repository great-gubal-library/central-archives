import { NewsRole } from '@app/shared/enums/news-role.enum';
import { Race } from '@app/shared/enums/race.enum';
import SharedConstants from '@app/shared/shared-constants';
import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { FreeCompany } from './free-company.entity';
import { Image } from './image.entity';
import { SearchFields } from './search-fields';
import { Server } from './server.entity';
import { User } from './user.entity';

@Entity()
@Unique(['name', 'server'])
@Unique(['lodestoneId', 'active'])
@Index(SearchFields.character, { fulltext: true })
export class Character extends BasicEntity {
  @Column({
    nullable: false,
  })
  lodestoneId: number;

  @Column({
    type: 'boolean',
    nullable: true,
    default: true,
  })
  active: boolean | null;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: Race,
    nullable: false,
  })
  race: Race;

  @Column({
    nullable: false,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  verifiedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  verificationCode: string | null;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: '',
  })
  appearance: string;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: '',
  })
  background: string;

  @Column({
    nullable: false,
    default: '',
  })
  occupation: string;

  @Column({
    nullable: false,
    default: '',
  })
  age: string;

  @Column({
    nullable: false,
    default: '',
  })
  birthplace: string;

  @Column({
    nullable: false,
    default: '',
  })
  residence: string;

  @Column({
    nullable: false,
    default: '',
  })
  title: string;

  @Column({
    nullable: false,
    default: '',
  })
  nickname: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  motto: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  loves: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  hates: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  friends: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  relatives: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  enemies: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  motivation: string;

  @Column({
    nullable: false,
    width: 100,
    default: '',
  })
  carrdProfile: string;

  @Column({
    nullable: false,
    default: true,
  })
  showAvatar: boolean;

  @Column({
    nullable: false,
    default: true,
  })
  showInfoboxes: boolean;

  @Column({
    nullable: false,
    default: false,
  })
  combinedDescription: boolean;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  currently: string;

  @Column({
    nullable: false,
    length: 1000,
    default: '',
  })
  oocInfo: string;

  @Column({
    nullable: false,
    length: SharedConstants.MAX_PRONOUNS_LENGTH,
    default: '',
  })
  pronouns: string;

  @Column({
    nullable: false,
    length: 255,
    default: '',
  })
  nationality: string;

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image | null>;

  @ManyToOne(() => FreeCompany, {
    lazy: true,
  })
  freeCompany: Promise<FreeCompany | null>;

  @Column({
    type: 'enum',
    enum: NewsRole,
    nullable: false,
    default: NewsRole.NONE,
  })
  newsRole: NewsRole;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  newsPseudonym: string|null;

  @Column({
    nullable: false,
    default: true,
  })
  showInPlayerProfile: boolean;
}
