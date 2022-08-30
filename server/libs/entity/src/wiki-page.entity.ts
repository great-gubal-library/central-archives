import { EditPermission } from '@app/shared/enums/edit-permission.enum';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BasicEntity } from './basic.entity';
import { Character } from './character.entity';
import { SearchFields } from './search-fields';

@Entity()
@Index(SearchFields.wikiPage, { fulltext: true })
export class WikiPage extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  owner: Character;

  @Column({
    nullable: false,
    unique: true,
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
    enum: EditPermission,
    nullable: false,
    default: EditPermission.ME,
  })
  editPermission: EditPermission;
}
