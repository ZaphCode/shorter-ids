import { AuthPayload } from "./shared/auth";
import { SubscriptionEntity } from "./db/entities/Subscription.entity";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
      subscription?: SubscriptionEntity;
    }
  }
}

export {};
