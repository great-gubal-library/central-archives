import { Column, Entity, Index, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { CommunityTag } from './community-tag.entity';
import { Image } from './image.entity';
import { SearchFields } from './search-fields';
import { Region } from '@app/shared/enums/region.enum';

@Entity()
@Unique('uq_community_name_region', ['name', 'region'])
@Index(SearchFields.community, { fulltext: true })
export class Community extends BasicEntity {
  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Region,
  })
  region: Region;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  owner: Character;

  @Column({
    type: 'date',
    nullable: true,
  })
  foundedAt: string | null;

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
  discord: string;

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

  @OneToMany(() => CommunityTag, (tag) => tag.community, {
    cascade: true,
  })
  tags: CommunityTag[];
}
