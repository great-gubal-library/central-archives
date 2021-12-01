import { Role } from '@app/shared/enums/role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';

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
    default: Role.UNVERIFIED,
    nullable: false,
  })
  role: Role | null;

  @Column({
    nullable: true
  })
  verifiedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true
  })
  verificationCode: string|null;

  @Column({
    type: 'varchar',
    nullable: true
  })
  newEmail: string|null;

  @Column({
    type: 'varchar',
    nullable: true
  })
  newEmailVerificationCode: string|null;
}
