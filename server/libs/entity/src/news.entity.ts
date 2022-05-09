import { NewsStatus } from '@app/shared/enums/news-status.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { NewsCategory } from './news-category.entity';

@Entity()
export class News extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  owner: Character;

  @Column({
    nullable: false,
  })
  title: string;

  @Column({
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: ''
  })
  content: string;

  @Column({
    nullable: true,
  })
  publishedAt: Date;

  @ManyToOne(() => NewsCategory, {
    nullable: false,
  })
	category: NewsCategory[];

  @Column({
    type: 'enum',
    enum: NewsStatus,
    nullable: false,
  })
  status: NewsStatus;
}
