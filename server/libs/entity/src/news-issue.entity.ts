import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { News } from "./news.entity";

export class NewsIssue extends BasicEntity {
	@PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  publishedAt: Date;

	@OneToMany(() => News, news => news.issue)
	articles: News[];
}
