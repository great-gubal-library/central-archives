import { EventSource } from '@app/shared/enums/event-source.enum';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { EventLocation } from './event-location.entity';
import { EventAnnouncement } from './event-announcement.entity';
import { Image } from './image.entity';

@Entity()
export class Event extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  title: string;

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
