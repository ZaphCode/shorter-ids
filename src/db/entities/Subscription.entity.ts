import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { PaymentEntity } from "./Payment.entity";
import { UserEntity } from "./User.entity";

@Entity({ name: "subscriptions" })
export class SubscriptionEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid", unique: true })
  userId!: string;

  @OneToOne(() => UserEntity, (user) => user.subscription, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "starts_at", type: "varchar", length: 40 })
  startsAt!: string;

  @Column({ name: "expires_at", type: "varchar", length: 40 })
  expiresAt!: string;

  @Column({ type: "varchar", length: 20, default: "inactive" })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => PaymentEntity, (payment) => payment.subscription)
  payments!: PaymentEntity[];
}
