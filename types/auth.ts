import type { USER_ROLES } from "@/lib/constants/roles";
import type { EntityId, TimestampedEntity } from "@/types/common";

export type AppRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface UserProfile extends TimestampedEntity {
  id: EntityId;
  authUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: AppRole;
}
