export const jwtConstants = {
  secret: process.env.JWT_SECRET || '',
  secretRefresh: process.env.JWT_SECRET_REFRESH || '',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
