function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const PORT = process.env.PORT || 3000;
