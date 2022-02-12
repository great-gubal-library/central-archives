import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Community } from './community.entity';

@Entity()
export class CommunityTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Community, community => community.tags, {
    nullable: false,
  })
  community: Community;

  @Column({
    nullable: false,
    type: 'varchar',
    width: 60,
  })
  name: string;

  constructor(properties?: Partial<CommunityTag>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
