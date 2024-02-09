import { User2FAState } from "@app/shared/enums/user-2fa-state.dto";

export interface User2FAStatusDto {
  state: User2FAState;
  qrDataUrl: string | null;
}
