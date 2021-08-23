import { Length, Matches } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from '.';

export enum Role {
  USER = 'user',
}

@Entity({ name: 'user' })
export class UserEntity extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    nullable: false,
  })
  passwordHash: string;

  @Column({
    nullable: false,
    length: 80,
  })
  username: string;

  @Column({
    nullable: false,
    length: 4,
  })
  @Length(4, 4)
  @Matches(/^[0-9]{4}$/)
  uniquifier: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  role: Role | null;
}
