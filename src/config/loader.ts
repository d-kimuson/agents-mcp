import { readFileSync } from 'node:fs';
import { configSchema, type Config } from './schema';

export const loadConfig = (configPath: string): Config => {
  const content = readFileSync(configPath, 'utf-8');
  const json: unknown = JSON.parse(content);
  return configSchema.parse(json);
};
