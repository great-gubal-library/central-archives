import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Event } from './event.entity';
import { Server } from "./server.entity";

@Entity()
export class EventLocation extends BasicEntity {
  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  address: string;

  @Column({
    nullable: false,
  })
  tags: string;

  @Column({
    nullable: false,
    default: '',
  })
  link: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @ManyToOne(() => Event, {
    nullable: false,
  })
  event: Event;
}
