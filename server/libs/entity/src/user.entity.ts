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
    nullable: false,
  })
  role: Role | null;

  @Column({
    nullable: true
  })
  verifiedAt: Date;

  @Column({
    nullable: true
  })
  verificationCode: string;
}
