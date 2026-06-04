import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { PaymentEntity } from "./Payment.entity";
import { SubscriptionEntity } from "./Subscription.entity";
import { ShortUrlEntity } from "./Url.entity";

@Entity({ name: "users" })
@Unique(["email"])
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => ShortUrlEntity, (shortUrl) => shortUrl.user)
  urls!: ShortUrlEntity[];

  @OneToOne(() => SubscriptionEntity, (subscription) => subscription.user)
  subscription!: SubscriptionEntity | null;

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments!: PaymentEntity[];
}
