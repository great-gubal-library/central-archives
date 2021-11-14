import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Event } from './event.entity';
import { Server } from "./server.entity";

@Entity()
export class EventLocation extends BasicEntity {
	@PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  location: string;

  @Column({
    nullable: false,
  })
  tags: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @ManyToOne(() => Event, {
    nullable: false,
  })
  event: Event;
}
