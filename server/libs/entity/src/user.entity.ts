import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

@Entity()
export class User extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: false,
  })
  role: Role | null;

  @Column()
  verifiedAt: Date;

  @Column()
  verificationCode: string;
}
