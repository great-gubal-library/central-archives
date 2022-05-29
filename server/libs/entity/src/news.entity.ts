import { NewsStatus } from '@app/shared/enums/news-status.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { Image } from './image.entity';
import { NewsCategory } from './news-category.entity';
import { NewsIssue } from './news-issue.entity';

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
    nullable: false,
    default: ''
  })
  subtitle: string;

  @Column({
    type: 'text',
    nullable: false,
    default: ''
  })
  summary: string;

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
	category: NewsCategory;

  @Column({
    type: 'enum',
    enum: NewsStatus,
    nullable: false,
  })
  status: NewsStatus;

  @ManyToOne(() => Image, {
    nullable: true,
  })
  image: Image|null;

  @ManyToOne(() => NewsIssue, {
    nullable: true,
  })
	issue: NewsIssue|null;
}
