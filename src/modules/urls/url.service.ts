import { DataSource } from "typeorm";
import { ShortUrlEntity } from "../../db/entities/Url.entity";
import { createShortCodeWithUniquenessCheck } from "../../utils/shortCode";
import { normalizeUrl, readRequiredString } from "../../utils/validation";
import { HttpError } from "../../shared/http-error";

type UrlServiceOptions = {
  dataSource: DataSource;
  baseUrl: string;
};

export class UrlService {
  constructor(private readonly options: UrlServiceOptions) {}

  async create(userId: string, payload: { originalUrl: unknown }) {
    const originalUrl = normalizeUrl(payload.originalUrl);

    if (!originalUrl) {
      throw new HttpError(400, "originalUrl es requerido");
    }

    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortCode = await createShortCodeWithUniquenessCheck(async (candidate) => {
      const existingUrl = await repository.findOne({
        where: { shortCode: candidate }
      });

      return Boolean(existingUrl);
    });

    const shortUrl = repository.create({
      userId,
      originalUrl,
      shortCode,
      isActive: true
    });

    await repository.save(shortUrl);

    return this.serialize(shortUrl);
  }

  async list(userId: string) {
    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const urls = await repository.find({
      where: { userId },
      order: { createdAt: "DESC" }
    });

    return urls.map((url) => this.serialize(url));
  }

  async getById(userId: string, id: unknown) {
    const shortUrl = await this.findOwnedUrl(userId, id);
    return this.serialize(shortUrl);
  }

  async update(userId: string, id: unknown, payload: { originalUrl: unknown }) {
    const originalUrl = normalizeUrl(payload.originalUrl);

    if (!originalUrl) {
      throw new HttpError(400, "originalUrl es requerido");
    }

    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortUrl = await this.findOwnedUrl(userId, id);

    shortUrl.originalUrl = originalUrl;

    await repository.save(shortUrl);

    return this.serialize(shortUrl);
  }

  async activate(userId: string, id: unknown) {
    return this.updateStatus(userId, id, true);
  }

  async deactivate(userId: string, id: unknown) {
    return this.updateStatus(userId, id, false);
  }

  async remove(userId: string, id: unknown) {
    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortUrl = await this.findOwnedUrl(userId, id);

    await repository.remove(shortUrl);
  }

  async resolveByShortCode(shortCode: unknown) {
    const code = readRequiredString(shortCode);

    if (!code) {
      throw new HttpError(400, "shortCode es requerido");
    }

    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortUrl = await repository.findOne({
      where: { shortCode: code }
    });

    if (!shortUrl) {
      throw new HttpError(404, "URL corta no encontrada");
    }

    if (!shortUrl.isActive) {
      throw new HttpError(410, "URL corta desactivada");
    }

    return shortUrl.originalUrl;
  }

  private async updateStatus(userId: string, id: unknown, isActive: boolean) {
    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortUrl = await this.findOwnedUrl(userId, id);

    shortUrl.isActive = isActive;

    await repository.save(shortUrl);

    return this.serialize(shortUrl);
  }

  private async findOwnedUrl(userId: string, id: unknown) {
    const urlId = readRequiredString(id);

    if (!urlId) {
      throw new HttpError(400, "id es requerido");
    }

    const repository = this.options.dataSource.getRepository(ShortUrlEntity);
    const shortUrl = await repository.findOne({
      where: { id: urlId, userId }
    });

    if (!shortUrl) {
      throw new HttpError(404, "URL no encontrada");
    }

    return shortUrl;
  }

  private serialize(shortUrl: ShortUrlEntity) {
    return {
      id: shortUrl.id,
      userId: shortUrl.userId,
      originalUrl: shortUrl.originalUrl,
      shortCode: shortUrl.shortCode,
      shortUrl: `${this.options.baseUrl}/url/${shortUrl.shortCode}`,
      isActive: shortUrl.isActive,
      createdAt: shortUrl.createdAt.toISOString(),
      updatedAt: shortUrl.updatedAt.toISOString()
    };
  }
}
