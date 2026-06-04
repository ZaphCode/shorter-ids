import { DataSource } from "typeorm";
import {
  SUBSCRIPTION_AMOUNT_IN_CENTS,
  SUBSCRIPTION_CURRENCY
} from "../../config/constants";
import { PaymentEntity } from "../../db/entities/Payment.entity";
import { SubscriptionEntity } from "../../db/entities/Subscription.entity";
import { HttpError } from "../../shared/http-error";
import { getNextExpirationDate, resolveSubscriptionStatus } from "../../shared/subscription";

type SubscriptionServiceOptions = {
  dataSource: DataSource;
};

export class SubscriptionService {
  constructor(private readonly options: SubscriptionServiceOptions) {}

  async pay(userId: string) {
    const subscriptionRepository = this.options.dataSource.getRepository(SubscriptionEntity);
    const paymentRepository = this.options.dataSource.getRepository(PaymentEntity);
    const now = new Date();
    const currentSubscription = await subscriptionRepository.findOne({
      where: { userId }
    });

    let subscription = currentSubscription;
    const currentStatus = resolveSubscriptionStatus(currentSubscription, now);

    if (!subscription) {
      subscription = subscriptionRepository.create({
        userId,
        startsAt: now.toISOString(),
        expiresAt: getNextExpirationDate(now).toISOString(),
        status: "active"
      });
    } else if (currentStatus === "active") {
      subscription.expiresAt = getNextExpirationDate(new Date(subscription.expiresAt)).toISOString();
      subscription.status = "active";
    } else {
      subscription.startsAt = now.toISOString();
      subscription.expiresAt = getNextExpirationDate(now).toISOString();
      subscription.status = "active";
    }

    await subscriptionRepository.save(subscription);

    const payment = paymentRepository.create({
      userId,
      subscriptionId: subscription.id,
      amountInCents: SUBSCRIPTION_AMOUNT_IN_CENTS,
      currency: SUBSCRIPTION_CURRENCY,
      status: "paid",
      paidAt: now.toISOString()
    });

    await paymentRepository.save(payment);

    return {
      subscription: this.serializeSubscription(subscription),
      payment: this.serializePayment(payment)
    };
  }

  async getCurrent(userId: string) {
    const subscriptionRepository = this.options.dataSource.getRepository(SubscriptionEntity);
    const subscription = await subscriptionRepository.findOne({ where: { userId } });
    const status = resolveSubscriptionStatus(subscription);

    if (!subscription) {
      return {
        isActive: false,
        status,
        startsAt: null,
        expiresAt: null
      };
    }

    return this.serializeSubscription(subscription);
  }

  async getPaymentHistory(userId: string) {
    const paymentRepository = this.options.dataSource.getRepository(PaymentEntity);
    const payments = await paymentRepository.find({
      where: { userId },
      order: { paidAt: "DESC" }
    });

    return payments.map((payment) => this.serializePayment(payment));
  }

  private serializeSubscription(subscription: SubscriptionEntity) {
    return {
      id: subscription.id,
      isActive: resolveSubscriptionStatus(subscription) === "active",
      status: resolveSubscriptionStatus(subscription),
      startsAt: subscription.startsAt,
      expiresAt: subscription.expiresAt
    };
  }

  private serializePayment(payment: PaymentEntity) {
    return {
      id: payment.id,
      subscriptionId: payment.subscriptionId,
      amountInCents: payment.amountInCents,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt
    };
  }
}
