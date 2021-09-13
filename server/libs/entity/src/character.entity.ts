import { Race } from '@app/shared/enums/race.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Server } from './server.entity';
import { User } from './user.entity';

@Entity()
export class Character extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  lodestoneId: number;

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
    nullable: true
  })
  verifiedAt: Date;

  @Column({
    type: 'text',
    nullable: true
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
}
