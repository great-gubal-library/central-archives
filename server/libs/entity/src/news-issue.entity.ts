import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { News } from "./news.entity";

@Entity()
export class NewsIssue extends BasicEntity {
  @Column({
    nullable: true,
  })
  publishedAt: Date;

	@OneToMany(() => News, news => news.issue)
	articles: News[];
}
