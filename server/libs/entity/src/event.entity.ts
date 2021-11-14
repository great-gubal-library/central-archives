import { EventSource } from '@app/shared/enums/event-source.enum';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Character } from "./character.entity";
import { EventLocation } from "./event-location.entity";

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
    default: ''
  })
  details: string;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: ''
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
    nullable: false,
  })
  endDateTime: Date;

  @Column({
    nullable: false,
  })
  link: string;

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

	@OneToMany(() => EventLocation, 'event')
	locations: EventLocation[];
}
