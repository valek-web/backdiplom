export type SingTokenType = {
  sub: number;
  isSystemAdmin: boolean;
  type: 'refresh' | 'access';
  version: number;
};
