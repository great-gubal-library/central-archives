import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Event } from './event.entity';

@Entity()
export class EventNotification extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

	@ManyToOne(() => Event, {
		nullable: false,
	})
	event: Event;

	@Column({
    nullable: false,
  })
	minutesBefore: number;

	@Column({
    nullable: false,
  })
	notifyAt: Date;
}
