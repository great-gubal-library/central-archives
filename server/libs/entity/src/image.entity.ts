import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';

@Entity()
@Unique(['hash', 'owner'])
export class Image extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  owner: Character;

  @Column({
    nullable: false,
  })
  width: number;

  @Column({
    nullable: false,
  })
  height: number;

  @Column({
    nullable: false,
  })
  size: number;

  @Column({
    nullable: false,
  })
  hash: string;

  @Column({
    nullable: false,
  })
  filename: string;

	@Column({
		type: 'enum',
		enum: ImageCategory,
    nullable: false,
  })
  category: ImageCategory;

  @Column({
    nullable: false,
    default: ''
  })
  title: string;

  @Column({
    type: 'mediumtext',
    nullable: false,
    default: ''
  })
  description: string;

  @Column({
    nullable: false,
    default: ''
  })
  credits: string;

	@Column({
		type: 'enum',
		enum: ImageFormat,
    nullable: false,
  })
  format: ImageFormat;
}
