import { Column, Entity, ManyToOne } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { User } from "./user.entity";
import { OAuthApp } from "./oauth-app.entity";
import { RequestStatus } from "@app/shared/enums/oauth/request-status.enum";
import { AuthFlow } from "@app/shared/enums/oauth/auth-flow.enum";

@Entity({
  name: 'oauth_request',
})
export class OAuthRequest extends BasicEntity {
  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;

  @ManyToOne(() => OAuthApp, {
    nullable: false,
  })
  app: OAuthApp;

  @Column({
    type: 'enum',
    enum: RequestStatus,
  })
  status: RequestStatus;

  @Column({
    type: 'enum',
    enum: AuthFlow,
  })
  flow: AuthFlow;

  @Column({
    length: 1000,
  })
  scopes: string;

  @Column({
    length: 2000,
  })
  redirectUri: string;

  @Column({
    length: 39,
  })
  ip: string;

  @Column({
    length: 2000,
  })
  state: string;

  @Column({
    length: 128,
  })
  codeChallenge: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 32,
  })
  code: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 9,
  })
  userCode: string | null;

  @Column()
  expiresAt: Date;
}
