import { DataSource } from "typeorm";
import { UserEntity } from "../../db/entities/User.entity";
import { createAuthToken } from "../../shared/auth";
import { HttpError } from "../../shared/http-error";
import { hashPassword, verifyPassword } from "../../utils/password";
import { normalizeEmail, readRequiredString } from "../../utils/validation";

type AuthServiceOptions = {
  dataSource: DataSource;
  jwtSecret: string;
};

export class AuthService {
  constructor(private readonly options: AuthServiceOptions) {}

  async register(payload: { email: unknown; password: unknown }) {
    const email = normalizeEmail(payload.email);
    const password = readRequiredString(payload.password);

    if (!email || !password) {
      throw new HttpError(400, "email y password son requeridos");
    }

    const repository = this.options.dataSource.getRepository(UserEntity);
    const existingUser = await repository.findOne({ where: { email } });

    if (existingUser) {
      throw new HttpError(409, "El email ya existe");
    }

    const user = repository.create({
      email,
      passwordHash: hashPassword(password)
    });

    await repository.save(user);

    return {
      id: user.id,
      email: user.email
    };
  }

  async login(payload: { email: unknown; password: unknown }) {
    const email = normalizeEmail(payload.email);
    const password = readRequiredString(payload.password);

    if (!email || !password) {
      throw new HttpError(400, "email y password son requeridos");
    }

    const repository = this.options.dataSource.getRepository(UserEntity);
    const user = await repository.findOne({ where: { email } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, "Credenciales invalidas");
    }

    return {
      token: createAuthToken({ sub: user.id, email: user.email }, this.options.jwtSecret),
      user: {
        id: user.id,
        email: user.email
      }
    };
  }
}
