import { NoticeboardLocation } from '@app/shared/enums/noticeboard-location.enum';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { SearchFields } from './search-fields';

@Entity()
@Index(SearchFields.noticeboardItem, { fulltext: true })
export class NoticeboardItem extends BasicEntity {
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
    enum: NoticeboardLocation,
    nullable: false,
  })
  location: NoticeboardLocation;
}
