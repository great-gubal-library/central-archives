import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { User } from "./user.entity";
import { OAuthApp } from "./oauth-app.entity";
import { ConsentStatus } from "@app/shared/enums/oauth/consent-status.enum";

@Entity({
  name: 'oauth_user_app_consent',
})
@Unique('uq_oauth_user_app_consent', [ 'user', 'app', 'scope' ])
export class OAuthUserAppConsent extends BasicEntity {
  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;

  @ManyToOne(() => OAuthApp, {
    nullable: false,
  })
  app: OAuthApp;

  @Column()
  scope: string;

  @Column({
    type: 'enum',
    enum: ConsentStatus,
  })
  status: ConsentStatus;
}
