import { config } from "dotenv";
import { z } from "zod";
import { MONGODB_URI_REGEX_PATTERN } from "./contants";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().regex(/^\d+$/).optional().default("5050"),
  MONGODB_URI: z.string().refine((value) => {
    return MONGODB_URI_REGEX_PATTERN.test(value);
  }, "Invalid MongoDB URI"),
});

const parsedSchema = envSchema.parse(process.env);

export type EnvSchemaType = z.infer<typeof envSchema>;

export default {
  NODE_ENV: parsedSchema.NODE_ENV,
  PORT: parsedSchema.PORT,
  MONGODB_URI: parsedSchema.MONGODB_URI,
};
