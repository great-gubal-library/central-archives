import { EventSource } from '@app/shared/enums/event-source.enum';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { EventLocation } from './event-location.entity';
import { EventAnnouncement } from './event-announcement.entity';
import { Image } from './image.entity';
import { SearchFields } from './search-fields';
import { Region } from '@app/shared/enums/region.enum';

@Entity()
@Index(SearchFields.event, { fulltext: true })
export class Event extends BasicEntity {
  @Column({
    nullable: false,
  })
  title: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Region,
  })
  region: Region;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: '',
  })
  details: string;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: '',
  })
  oocDetails: string;

  @ManyToOne(() => Character, {
    nullable: true,
  })
  owner: Character;

  @Column({
    nullable: false,
  })
  startDateTime: Date;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  endDateTime: Date | null;

  @Column({
    nullable: false,
    default: '',
  })
  link: string;

  @Column({
    nullable: false,
    default: '',
  })
  contact: string;

  @Column({
    nullable: true,
    unique: true,
  })
  externalSourceLink: string;

  @Column({
    type: 'enum',
    enum: EventSource,
    nullable: false,
  })
  source: EventSource;

  @Column({
    nullable: false,
    default: false,
  })
  hidden: boolean;

  @Column({
    nullable: false,
    default: false,
  })
  recurring: boolean;

  @ManyToOne(() => Image, {
    lazy: true,
  })
  banner: Promise<Image|null>;

  @OneToMany(() => EventLocation, 'event', {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  locations: EventLocation[];

  @OneToMany(() => EventAnnouncement, 'event', {
    cascade: true,
    orphanedRowAction: 'delete',
    lazy: true,
  })
  announcements: Promise<EventAnnouncement[]>;
}
