export type User = {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShortUrl = {
  id: string;
  userEmail: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
