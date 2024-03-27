import { Column, Entity, ManyToOne } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { User } from "./user.entity";
import { OAuthApp } from "./oauth-app.entity";

@Entity({
  name: 'oauth_refresh_grant',
})
export class OAuthRefreshGrant extends BasicEntity {
  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;

  @ManyToOne(() => OAuthApp, {
    nullable: false,
  })
  app: OAuthApp;

  @Column({
    length: 1000,
  })
  scopes: string;

  @Column({
    length: 32,
    unique: true,
  })
  refreshToken: string;

  @Column()
  expiresAt: Date;
}
