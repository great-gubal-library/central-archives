import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';

@Entity()
export class NewsCategory extends BasicEntity {
  @Column({
    nullable: false,
		unique: true,
  })
  name: string;
}
