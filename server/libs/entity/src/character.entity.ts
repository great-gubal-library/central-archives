import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Server } from './server.entity';
import { User } from './user.entity';

export enum Race {
  HYUR = 'hyur',
  ELEZEN = 'elezen',
  LALAFELL = 'lalafell',
  MIQOTE = 'miqote',
  ROEGADYN = 'roegadyn',
  AURA = 'aura',
  HROTHGAR = 'hrothgar',
  VIERA = 'viera',
}

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

  @Column()
  verificationCode: string;

  @ManyToOne(() => Server, {
    nullable: false,
  })
  server: Server;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;
}
