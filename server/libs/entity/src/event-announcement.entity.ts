import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Event } from './event.entity';

@Entity()
export class EventAnnouncement extends BasicEntity {
	@ManyToOne(() => Event, {
		nullable: false,
	})
	event: Event;

	@Column({
    nullable: false,
  })
	minutesBefore: number;

	@Column({
		type: 'text',
    nullable: false,
  })
	content: string;

	@Column({
    nullable: false,
  })
	postAt: Date;
}
