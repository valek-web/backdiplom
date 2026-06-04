import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string, name?: string) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Сброс пароля - Фокус CRM</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            background: linear-gradient(135deg, #0a0e1a 0%, #0f1320 100%);
            color: #ffffff;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .card {
            background: rgba(18, 22, 35, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(22, 119, 255, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .logo {
            padding: 32px 32px 0;
            text-align: center;
          }
          .logo h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 32px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .greeting strong {
            color: #1677ff;
            font-weight: 600;
          }
          .message {
            font-size: 15px;
            color: #a0a8c0;
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .code-wrapper {
            background: linear-gradient(135deg, rgba(22, 119, 255, 0.1) 0%, rgba(22, 119, 255, 0.05) 100%);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            border: 1px solid rgba(22, 119, 255, 0.3);
          }
          .code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #1677ff;
            font-family: 'SF Mono', 'Courier New', monospace;
            text-shadow: 0 0 20px rgba(22, 119, 255, 0.3);
          }
          .warning {
            background: rgba(255, 77, 79, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            border-left: 3px solid #ff4d4f;
          }
          .warning p {
            color: #ff7875;
            font-size: 13px;
            margin: 6px 0;
            line-height: 1.5;
          }
          .warning strong {
            color: #ff4d4f;
            font-weight: 600;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(22, 119, 255, 0.3), transparent);
            margin: 32px 0 24px;
          }
          .footer {
            text-align: center;
            padding: 0 32px 32px;
          }
          .footer p {
            font-size: 12px;
            color: #5a627c;
            margin: 8px 0;
          }
          @media (max-width: 600px) {
            .container {
              padding: 24px;
            }
            .content {
              padding: 24px;
            }
            .code {
              font-size: 32px;
              letter-spacing: 6px;
            }
            .logo h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Фокус CRM</h1>
            </div>
            <div class="content">
              <div class="greeting">
                ${name ? `Привет, <strong>${name}</strong>!` : 'Привет!'}
              </div>
              <div class="message">
                Мы получили запрос на сброс пароля для вашего аккаунта в CRM системе "Фокус". 
                Используйте код ниже для подтверждения операции.
              </div>
              <div class="code-wrapper">
                <div class="code">${code}</div>
              </div>
              <div class="warning">
                <p><strong>🔒 Безопасность превыше всего</strong></p>
                <p>• Код действителен 15 минут</p>
                <p>• Никогда и никому не сообщайте этот код</p>
                <p>• Если вы не запрашивали сброс, просто проигнорируйте письмо</p>
              </div>
              <div class="divider"></div>
              <div class="message" style="font-size: 13px; margin-bottom: 0;">
                Система безопасности "Фокус" защищает ваш аккаунт 24/7
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Фокус CRM. Все права защищены</p>
              <p>Это автоматическое сообщение, не отвечайте на него</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.sendEmail({
      to: email,
      subject: `Сброс пароля - Фокус CRM`,
      html,
    });
  }

  // Отправка кода для регистрации
  async sendRegistrationCode(email: string, code: number, name?: string) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Регистрация - Фокус CRM</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            background: linear-gradient(135deg, #0a0e1a 0%, #0f1320 100%);
            color: #ffffff;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .card {
            background: rgba(18, 22, 35, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(22, 119, 255, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .logo {
            padding: 32px 32px 0;
            text-align: center;
          }
          .logo h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 32px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #ffffff;
          }
          .greeting strong {
            color: #1677ff;
            font-weight: 600;
          }
          .message {
            font-size: 15px;
            color: #a0a8c0;
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .code-wrapper {
            background: linear-gradient(135deg, rgba(22, 119, 255, 0.1) 0%, rgba(22, 119, 255, 0.05) 100%);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            border: 1px solid rgba(22, 119, 255, 0.3);
          }
          .code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #1677ff;
            font-family: 'SF Mono', 'Courier New', monospace;
            text-shadow: 0 0 20px rgba(22, 119, 255, 0.3);
          }
          .features {
            display: flex;
            gap: 16px;
            margin: 32px 0;
            flex-wrap: wrap;
          }
          .feature {
            flex: 1;
            text-align: center;
            padding: 16px;
            background: rgba(22, 119, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(22, 119, 255, 0.1);
          }
          .feature span {
            font-size: 24px;
            display: block;
            margin-bottom: 8px;
          }
          .feature p {
            font-size: 12px;
            color: #a0a8c0;
            margin: 0;
          }
          .warning {
            background: rgba(255, 77, 79, 0.1);
            border-radius: 12px;
            padding: 16px;
            margin: 24px 0;
            border-left: 3px solid #ff4d4f;
          }
          .warning p {
            color: #ff7875;
            font-size: 13px;
            margin: 4px 0;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(22, 119, 255, 0.3), transparent);
            margin: 32px 0 24px;
          }
          .footer {
            text-align: center;
            padding: 0 32px 32px;
          }
          .footer p {
            font-size: 12px;
            color: #5a627c;
            margin: 8px 0;
          }
          @media (max-width: 600px) {
            .container {
              padding: 24px;
            }
            .content {
              padding: 24px;
            }
            .code {
              font-size: 32px;
              letter-spacing: 6px;
            }
            .features {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Фокус CRM</h1>
            </div>
            <div class="content">
              <div class="greeting">
                ${name ? `Добро пожаловать, <strong>${name}</strong>!` : 'Добро пожаловать!'}
              </div>
              <div class="message">
                Вы на шаге от эффективного управления бизнесом. Подтвердите регистрацию в CRM "Фокус".
              </div>
              <div class="code-wrapper">
                <div class="code">${code}</div>
              </div>
              <div class="features">
                <div class="feature">
                  <span>📊</span>
                  <p>Управление продажами</p>
                </div>
                <div class="feature">
                  <span>✅</span>
                  <p>Задачи и проекты</p>
                </div>
                <div class="feature">
                  <span>🤖</span>
                  <p>Автоматизация</p>
                </div>
              </div>
              <div class="warning">
                <p><strong>🔐 Код подтверждения</strong></p>
                <p>Действителен 15 минут • Не сообщайте никому</p>
              </div>
              <div class="divider"></div>
              <div class="message" style="font-size: 13px; margin-bottom: 0;">
                Присоединяйтесь к команде профессионалов, которые выбирают "Фокус"
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Фокус CRM. Все права защищены</p>
              <p>Это автоматическое сообщение, не отвечайте на него</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.sendEmail({
      to: email,
      subject: `Регистрация в Фокус CRM`,
      html,
    });
  }

  // Отправка приглашения для регистрации
  async sendRegistrationInvite(email: string, invitedBy: string) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Приглашение - Фокус CRM</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            background: linear-gradient(135deg, #0a0e1a 0%, #0f1320 100%);
            color: #ffffff;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .card {
            background: rgba(18, 22, 35, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(22, 119, 255, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .logo {
            padding: 32px 32px 0;
            text-align: center;
          }
          .logo h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: #ffffff;
          }
          .content {
            padding: 32px;
            text-align: center;
          }
          .invite-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          .message {
            font-size: 16px;
            color: #a0a8c0;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .inviter {
            color: #1677ff;
            font-weight: 600;
            font-size: 18px;
          }
          .btn-wrapper {
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
            color: #ffffff;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(22, 119, 255, 0.4);
          }
          .link {
            font-size: 12px;
            color: #5a627c;
            margin-top: 24px;
            word-break: break-all;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(22, 119, 255, 0.3), transparent);
            margin: 32px 0;
          }
          .footer {
            text-align: center;
            padding: 0 32px 32px;
          }
          .footer p {
            font-size: 12px;
            color: #5a627c;
            margin: 8px 0;
          }
          @media (max-width: 600px) {
            .container {
              padding: 24px;
            }
            .btn {
              padding: 12px 28px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Фокус CRM</h1>
            </div>
            <div class="content">
              <div class="invite-icon">
                🎯
              </div>
              <div class="message">
                <strong class="inviter">${invitedBy}</strong><br>
                приглашает вас присоединиться к команде<br>
                в CRM системе "Фокус"
              </div>
              <div class="btn-wrapper">
                <a href="https://ziryanov.studio-av.ru/register" class="btn">
                  Принять приглашение
                </a>
              </div>
              <div class="divider"></div>
              <div class="message" style="font-size: 13px; margin-bottom: 0;">
                🚀 Начните управлять бизнесом эффективно уже сегодня
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Фокус CRM. Все права защищены</p>
              <p>Это автоматическое сообщение, не отвечайте на него</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.sendEmail({
      to: email,
      subject: `Приглашение в Фокус CRM от ${invitedBy}`,
      html,
    });
  }

  // Уведомление о смене пароля
  async sendNoticeResetPassword(email: string) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Смена пароля - Фокус CRM</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            background: linear-gradient(135deg, #0a0e1a 0%, #0f1320 100%);
            color: #ffffff;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            padding: 48px 24px;
          }
          .card {
            background: rgba(18, 22, 35, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(22, 119, 255, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .logo {
            padding: 32px 32px 0;
            text-align: center;
          }
          .logo h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .content {
            padding: 32px;
            text-align: center;
          }
          .alert-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          .message {
            font-size: 16px;
            color: #a0a8c0;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          .warning-box {
            background: rgba(255, 77, 79, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid rgba(255, 77, 79, 0.3);
          }
          .warning-box p {
            color: #ff7875;
            margin: 8px 0;
            font-size: 14px;
          }
          .warning-box strong {
            color: #ff4d4f;
            font-size: 16px;
          }
          .btn-wrapper {
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
            color: #ffffff;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
            box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(22, 119, 255, 0.3), transparent);
            margin: 32px 0;
          }
          .footer {
            text-align: center;
            padding: 0 32px 32px;
          }
          .footer p {
            font-size: 12px;
            color: #5a627c;
            margin: 8px 0;
          }
          @media (max-width: 600px) {
            .container {
              padding: 24px;
            }
            .btn {
              padding: 12px 28px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Фокус CRM</h1>
            </div>
            <div class="content">
              <div class="alert-icon">
                🔐
              </div>
              <div class="message">
                <strong>Внимание!</strong><br>
                Пароль вашего аккаунта был изменен.
              </div>
              <div class="warning-box">
                <p><strong>⚠️ Если это были не вы</strong></p>
                <p>Немедленно смените пароль через форму восстановления</p>
                <p>Свяжитесь со службой поддержки для дополнительной защиты</p>
              </div>
              <div class="btn-wrapper">
                <a href="${process.env.FRONTEND_URL}/reset-password" class="btn">
                  Сменить пароль
                </a>
              </div>
              <div class="divider"></div>
              <div class="message" style="font-size: 13px; margin-bottom: 0;">
                🛡️ Фокус CRM — защита ваших данных на первом месте
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Фокус CRM. Все права защищены</p>
              <p>Это автоматическое сообщение, не отвечайте на него</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.sendEmail({
      to: email,
      subject: `Уведомление о смене пароля - Фокус CRM`,
      html,
    });
  }

  // Общий метод отправки email
  private async sendEmail(mailOptions: nodemailer.SendMailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"${process.env.APP_NAME}" <noreply@shop.com>`,
        ...mailOptions,
      });

      this.logger.log(`Email отправлен на ${mailOptions.to}`);
      return info;
    } catch (error) {
      this.logger.error(`Ошибка отправки email на ${mailOptions.to}:`, error);
      throw error;
    }
  }
}
