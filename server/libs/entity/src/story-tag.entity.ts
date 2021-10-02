import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Story } from './story.entity';

@Entity()
export class StoryTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Story, story => story.tags, {
    nullable: false,
  })
  story: Story;

  @Column({
    nullable: false,
    type: 'varchar',
    width: 60,
  })
  name: string;

  constructor(properties?: Partial<StoryTag>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
