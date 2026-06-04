import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { SubscriptionEntity } from "./Subscription.entity";
import { UserEntity } from "./User.entity";

@Entity({ name: "payments" })
export class PaymentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "subscription_id", type: "uuid" })
  subscriptionId!: string;

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subscription_id" })
  subscription!: SubscriptionEntity;

  @Column({ name: "amount_in_cents", type: "integer" })
  amountInCents!: number;

  @Column({ type: "varchar", length: 10 })
  currency!: string;

  @Column({ type: "varchar", length: 20, default: "paid" })
  status!: string;

  @Column({ name: "paid_at", type: "varchar", length: 40 })
  paidAt!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
