import { PageType } from "@app/shared/enums/page-type.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { User } from "./user.entity";

@Entity()
@Unique(['pageId', 'pageType', 'reportedBy', 'open'])
export class Violation extends BasicEntity {
	@PrimaryGeneratedColumn()
  id: number;

	@Column({
		type: 'enum',
		enum: PageType,
    nullable: false,
  })
	pageType: PageType;

	@Column({
    nullable: false,
  })
	pageId: number;

  @Column({
    type: 'text',
    nullable: false,
    default: ''
  })
  reason: string;

	@ManyToOne(() => User, {
    nullable: false,
  })
  reportedBy: User;

	@Column({
		type: 'boolean',
    nullable: true,
    default: true,
  })
	open: boolean|null;
}
