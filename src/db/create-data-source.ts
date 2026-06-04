import { DataSource } from "typeorm";
import { PaymentEntity } from "./entities/Payment.entity";
import { SubscriptionEntity } from "./entities/Subscription.entity";
import { UserEntity } from "./entities/User.entity";
import { ShortUrlEntity } from "./entities/Url.entity";

const entities = [UserEntity, SubscriptionEntity, PaymentEntity, ShortUrlEntity];

type PostgresDataSourceConfig = {
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
  };
};

export function createPostgresDataSource(config: PostgresDataSourceConfig) {
  return new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    synchronize: config.db.synchronize,
    entities
  });
}

export function createTestDataSource() {
  return new DataSource({
    type: "sqljs",
    autoSave: false,
    entities,
    synchronize: true
  });
}
