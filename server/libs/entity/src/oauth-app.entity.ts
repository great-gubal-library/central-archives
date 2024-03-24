import { AppType } from "@app/shared/enums/oauth/app-type.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { BasicEntity } from "./basic.entity";
import { Image } from "./image.entity";
import { User } from "./user.entity";
import { AuthScope } from "@app/shared/enums/oauth/auth-scope.enum";
import { AuthFlow } from "@app/shared/enums/oauth/auth-flow.enum";

@Entity({
  name: 'oauth_app',
})
export class OAuthApp extends BasicEntity {
  @Column({
    unique: true,
  })
  name: string;

  @Column({
    length: 2000,
  })
  description: string;

  @Column({
    type: 'uuid',
    unique: true,
  })
  clientId: string;

  @Column({
    type: 'enum',
    enum: AppType,
  })
  type: AppType;

  @Column({
    type: 'varchar',
    length: 39,
    nullable: true,
  })
  clientSecret: string | null;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  redirectUri: string | null;

  @Column({
    type: 'set',
    enum: AuthScope,
  })
  requestableScopes: AuthScope[];

  @Column({
    type: 'set',
    enum: AuthFlow,
  })
  enabledFlows: AuthFlow[];

  @Column({
    type: 'datetime',
    nullable: true
  })
  tokensValidAfter: Date | null;

  @Column({
    default: true,
  })
  active: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  blockedAt: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  blockReason: string | null;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User;

  @ManyToOne(() => Image, {
    nullable: true,
  })
  icon: Image | null;
}
