import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CodeGenerator {
  // Генерация 6-значного цифрового кода
  generateNumericCode(length: number = 6): string {
    const randomBytes = crypto.randomBytes(length);
    let code = '';

    for (let i = 0; i < length; i++) {
      code += (randomBytes[i] % 10).toString();
    }

    return code;
  }

  // Генерация токена для ссылок
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
