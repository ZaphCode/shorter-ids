import { ShortUrl, User } from "./models";

export const users = new Map<string, User>();
export const urlsById = new Map<string, ShortUrl>();
export const urlsByCode = new Map<string, ShortUrl>();
