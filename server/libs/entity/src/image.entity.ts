import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';

@Entity()
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
		type: 'enum',
		enum: ImageFormat,
    nullable: false,
  })
  format: ImageFormat;
}
