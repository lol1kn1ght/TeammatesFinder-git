import { Schema, model } from "mongoose";

export type PlayerSchemaType = {
  login?: string;
  nickname: string;
  coins?: number;
  platforms?: string[];
  description?: string;
  games: string[];
};

/**
 * Схема профиля базы данных игрока
 */
export const PlayerSchema = new Schema<PlayerSchemaType>(
  {
    login: String,
    nickname: String,
    coins: Number,
    platforms: [String],
    games: [String],
    description: String,
  },
  {
    versionKey: false,
  }
);

export const PlayerModel = model("gtaEZ", PlayerSchema, "users");
