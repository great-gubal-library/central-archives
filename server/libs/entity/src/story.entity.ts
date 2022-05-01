import { StoryType } from '@app/shared/enums/story-type.enum';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { SearchFields } from './search-fields';
import { StoryTag } from './story-tag.entity';

@Entity()
@Index(SearchFields.story, { fulltext: true })
export class Story extends BasicEntity {
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
    type: 'mediumtext',
    nullable: false,
    default: ''
  })
  content: string;

  @Column({
    type: 'enum',
    enum: StoryType,
    nullable: false,
  })
  type: StoryType;

  @OneToMany(() => StoryTag, tag => tag.story, {
    cascade: true,
  })
	tags: StoryTag[]
}
