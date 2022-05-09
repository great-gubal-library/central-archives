import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';

@Entity()
export class NewsCategory extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
		unique: true,
  })
  name: string;
}
