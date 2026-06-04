import assert from "node:assert/strict";
import test from "node:test";
import { DataSource } from "typeorm";
import { AuthService } from "../src/modules/auth/auth.service";
import { SubscriptionService } from "../src/modules/subscriptions/subscriptions.service";
import { UrlService } from "../src/modules/urls/url.service";
import { createTestDataSource } from "../src/db/create-data-source";
import { createRequireActiveSubscriptionMiddleware } from "../src/shared/subscription";
import { HttpError } from "../src/shared/http-error";

type TestContext = {
  dataSource: DataSource;
  authService: AuthService;
  subscriptionService: SubscriptionService;
  urlService: UrlService;
};

async function createContext(): Promise<TestContext> {
  const dataSource = createTestDataSource();
  await dataSource.initialize();

  return {
    dataSource,
    authService: new AuthService({
      dataSource,
      jwtSecret: "test-secret"
    }),
    subscriptionService: new SubscriptionService({ dataSource }),
    urlService: new UrlService({
      dataSource,
      baseUrl: "http://localhost:3000"
    })
  };
}

async function destroyContext(context: TestContext) {
  await context.dataSource.destroy();
}

async function invokeSubscriptionGuard(
  dataSource: DataSource,
  userId: string
): Promise<{ error: unknown; subscriptionWasAttached: boolean }> {
  const middleware = createRequireActiveSubscriptionMiddleware(dataSource);
  const req: Express.Request = {
    auth: {
      sub: userId,
      email: "ana@example.com"
    }
  } as Express.Request;

  const result = await new Promise<{ error: unknown; subscriptionWasAttached: boolean }>((resolve) => {
    void middleware(req, {} as Express.Response, (error?: unknown) => {
      resolve({
        error,
        subscriptionWasAttached: Boolean(req.subscription)
      });
    });
  });

  return result;
}

test("registers, logs in, pays a subscription, and stores payment history", async () => {
  const context = await createContext();

  try {
    const user = await context.authService.register({
      email: "ana@example.com",
      password: "secreto123"
    });

    assert.ok(user.id);
    assert.equal(user.email, "ana@example.com");

    const session = await context.authService.login({
      email: "ana@example.com",
      password: "secreto123"
    });

    assert.ok(session.token);
    assert.equal(session.user.email, "ana@example.com");

    const paymentResult = await context.subscriptionService.pay(session.user.id);

    assert.equal(paymentResult.subscription.isActive, true);
    assert.equal(paymentResult.payment.status, "paid");

    const currentSubscription = await context.subscriptionService.getCurrent(session.user.id);

    assert.equal(currentSubscription.isActive, true);
    assert.ok(currentSubscription.expiresAt);

    const history = await context.subscriptionService.getPaymentHistory(session.user.id);

    assert.equal(history.length, 1);
    assert.equal(history[0]?.currency, "MXN");
  } finally {
    await destroyContext(context);
  }
});

test("blocks URL operations when there is no active subscription and allows them after paying", async () => {
  const context = await createContext();

  try {
    const user = await context.authService.register({
      email: "ana@example.com",
      password: "secreto123"
    });

    const blocked = await invokeSubscriptionGuard(context.dataSource, user.id);

    assert.ok(blocked.error instanceof HttpError);
    assert.equal((blocked.error as HttpError).statusCode, 403);
    assert.equal(blocked.subscriptionWasAttached, false);

    await context.subscriptionService.pay(user.id);

    const allowed = await invokeSubscriptionGuard(context.dataSource, user.id);

    assert.equal(allowed.error, undefined);
    assert.equal(allowed.subscriptionWasAttached, true);
  } finally {
    await destroyContext(context);
  }
});

test("creates, lists, updates, toggles, resolves, and deletes short URLs", async () => {
  const context = await createContext();

  try {
    const user = await context.authService.register({
      email: "ana@example.com",
      password: "secreto123"
    });

    const created = await context.urlService.create(user.id, {
      originalUrl: "https://example.com/article"
    });

    assert.equal(created.isActive, true);
    assert.match(created.shortUrl, /\/url\//);

    const listed = await context.urlService.list(user.id);

    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.id, created.id);

    const details = await context.urlService.getById(user.id, created.id);

    assert.equal(details.originalUrl, "https://example.com/article");

    const updated = await context.urlService.update(user.id, created.id, {
      originalUrl: "https://openai.com/research"
    });

    assert.equal(updated.originalUrl, "https://openai.com/research");

    const resolvedUrl = await context.urlService.resolveByShortCode(created.shortCode);

    assert.equal(resolvedUrl, "https://openai.com/research");

    const deactivated = await context.urlService.deactivate(user.id, created.id);

    assert.equal(deactivated.isActive, false);

    await assert.rejects(
      context.urlService.resolveByShortCode(created.shortCode),
      (error: unknown) => error instanceof HttpError && error.statusCode === 410
    );

    const activated = await context.urlService.activate(user.id, created.id);

    assert.equal(activated.isActive, true);

    await context.urlService.remove(user.id, created.id);

    const finalList = await context.urlService.list(user.id);

    assert.equal(finalList.length, 0);
  } finally {
    await destroyContext(context);
  }
});
