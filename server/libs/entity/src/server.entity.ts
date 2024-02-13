import { Region } from '@app/shared/enums/region.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  datacenter: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Region,
  })
  region: Region;
}
