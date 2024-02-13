import { Region } from '@app/shared/enums/region.enum';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('uq_server_name', [ 'name' ])
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
