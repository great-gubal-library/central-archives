import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Character } from "./character.entity";
import { Community } from "./community.entity";

@Entity()
@Unique(['character', 'community'])
export class CommunityMembership extends BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, {
    nullable: false,
  })
  character: Character;

  @ManyToOne(() => Community, {
    nullable: false,
  })
  community: Community;

	@Column({
    nullable: false,
    default: false
  })
	confirmed: boolean;

	@Column({
    nullable: false,
    default: false
  })
	canEdit: boolean;

	@Column({
    nullable: false,
    default: false
  })
	canManageMembers: boolean;
}
