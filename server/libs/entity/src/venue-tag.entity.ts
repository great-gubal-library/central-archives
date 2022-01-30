import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Venue } from './venue.entity';

@Entity()
export class VenueTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venue, venue => venue.tags, {
    nullable: false,
  })
  venue: Venue;

  @Column({
    nullable: false,
    type: 'varchar',
    width: 60,
  })
  name: string;

  constructor(properties?: Partial<VenueTag>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
