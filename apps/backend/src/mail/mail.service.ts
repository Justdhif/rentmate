import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

export interface BrandedEmailOptions {
  to: string | string[];
  subject: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info';
  heading: string;
  subheading?: string;
  contentHtml: string;
  metadata?: Array<{ label: string; value: string; isHighlight?: boolean }>;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('SMTP_PORT') || 465);
    const secure = this.configService.get<string>('SMTP_SECURE') !== 'false';
    const user = this.configService.get<string>('SMTP_USER') || '';
    const rawPass = this.configService.get<string>('SMTP_PASS') || '';
    const pass = rawPass.replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.verifyConnection();
      this.logger.log('SMTP Connection to Gmail verified successfully.');
    } catch (error: any) {
      this.logger.warn(`SMTP Verification failed on startup: ${error.message}`);
    }
  }

  /**
   * Menguji konektivitas ke server SMTP
   */
  async verifyConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP Connection error:', error);
          reject(error);
        } else {
          resolve(!!success);
        }
      });
    });
  }

  /**
   * Mengirim email umum
   */
  async sendMail(options: SendMailOptions) {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      `"RentMate" <${this.configService.get<string>('SMTP_USER')}>`;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email successfully sent to ${options.to}: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mengirim email dengan template branding RentMate Web UI
   */
  async sendBrandedMail(options: BrandedEmailOptions) {
    const html = this.renderWebThemedTemplate(options);
    const plainText =
      options.heading +
      (options.subheading ? `\n${options.subheading}` : '') +
      `\n\n${options.subject}\n\nRentMate — Smart Kost Platform`;

    return this.sendMail({
      to: options.to,
      subject: options.subject,
      text: plainText,
      html,
    });
  }

  /**
   * Mengirim email tes verifikasi dengan UI Web RentMate
   */
  async sendTestMail(to: string) {
    const recipient = Array.isArray(to) ? to[0] : to;
    return this.sendBrandedMail({
      to,
      subject: 'RentMate — Verifikasi Konfigurasi SMTP Berhasil',
      badge: 'Notifikasi Sistem',
      badgeType: 'success',
      heading: 'Layanan Email Berhasil Terhubung',
      subheading:
        'Sistem SMTP Gmail telah terhubung secara optimal dengan antarmuka dan backend RentMate.',
      contentHtml: `
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
          Halo dari tim <strong>RentMate</strong>! Email ini merupakan konfirmasi bahwa modul SMTP pengiriman email telah selesai diintegrasikan dan disesuaikan dengan tema visual platform kami.
        </p>
        <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
          Layanan ini kini siap digunakan untuk pengiriman otomatis notifikasi tagihan (invoice), bukti pembayaran sewa, tiket pemeliharaan unit kost (maintenance), serta verifikasi akun pengguna.
        </p>
      `,
      metadata: [
        { label: 'Status Layanan', value: 'Terhubung & Aktif', isHighlight: true },
        { label: 'Host SMTP', value: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com' },
        { label: 'Port / Protokol', value: `${this.configService.get<string>('SMTP_PORT') || 465} (SSL / TLS)` },
        { label: 'Akun Pengirim', value: this.configService.get<string>('SMTP_USER') || '' },
        { label: 'Email Penerima', value: recipient },
        {
          label: 'Waktu Pengujian',
          value: new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            dateStyle: 'long',
            timeStyle: 'medium',
          }) + ' WIB',
        },
      ],
      ctaText: 'Buka Dashboard RentMate',
      ctaUrl: 'http://localhost:3000',
      footerNote:
        'Email ini dikirim secara otomatis oleh engine notifikasi RentMate. Anda dapat mengabaikan email ini jika merasa tidak melakukan pengujian.',
    });
  }

  /**
   * Template HTML responsif yang setema dengan UI Web RentMate:
   * Modern SaaS, Soft Neutral Background (#F8FAFC), Primary Color (#5B5FEF),
   * Clean Typography (Inter / Apple System), Subtle Borders & Card Radius (16px).
   */
  renderWebThemedTemplate(options: BrandedEmailOptions): string {
    const badgeColors = {
      primary: { bg: '#EEF2FF', text: '#5B5FEF', border: '#E0E7FF' },
      success: { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' },
      warning: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
      info: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
    };

    const currentBadge = badgeColors[options.badgeType || 'primary'];

    let metadataRowsHtml = '';
    if (options.metadata && options.metadata.length > 0) {
      metadataRowsHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 24px 0 16px 0; border-collapse: separate; overflow: hidden;">
        <tbody>
          ${options.metadata
            .map(
              (item, idx) => `
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: #64748B; border-bottom: ${idx < options.metadata!.length - 1 ? '1px solid #F1F5F9' : 'none'}; width: 38%; vertical-align: middle;">
                ${item.label}
              </td>
              <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: ${item.isHighlight ? '#16A34A' : '#0F172A'}; border-bottom: ${idx < options.metadata!.length - 1 ? '1px solid #F1F5F9' : 'none'}; vertical-align: middle;">
                ${item.isHighlight ? '<span style="display: inline-block; width: 7px; height: 7px; background-color: #16A34A; border-radius: 50%; margin-right: 6px; vertical-align: middle;"></span>' : ''}
                ${item.value}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      `;
    }

    let ctaButtonHtml = '';
    if (options.ctaText && options.ctaUrl) {
      ctaButtonHtml = `
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #5B5FEF;">
            <a href="${options.ctaUrl}" target="_blank" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF; text-decoration: none; padding: 13px 26px; border-radius: 10px; display: inline-block; font-weight: 600; letter-spacing: 0.2px;">
              ${options.ctaText} &rarr;
            </a>
          </td>
        </tr>
      </table>
      `;
    }

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${options.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
        <tr>
          <td align="center">
            <!-- Container Card -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; border-top: 4px solid #5B5FEF; box-shadow: 0 4px 20px -2px rgba(91, 95, 239, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04); overflow: hidden;">
              
              <!-- Brand Header Bar -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 1px solid #F1F5F9;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <!-- Logo & Title -->
                      <td style="vertical-align: middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="width: 36px; height: 36px; background-color: #5B5FEF; border-radius: 10px; text-align: center; vertical-align: middle;">
                              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 19px; font-weight: 800; color: #FFFFFF; line-height: 36px; display: inline-block;">R</span>
                            </td>
                            <td style="padding-left: 12px; vertical-align: middle;">
                              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px; display: block; line-height: 1.2;">RentMate</span>
                              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 500; color: #64748B; display: block; line-height: 1.2; margin-top: 2px;">Smart Kost Platform</span>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- Category Badge (Right) -->
                      ${
                        options.badge
                          ? `
                      <td align="right" style="vertical-align: middle;">
                        <span style="display: inline-block; padding: 5px 12px; background-color: ${currentBadge.bg}; color: ${currentBadge.text}; border: 1px solid ${currentBadge.border}; border-radius: 9999px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase;">
                          ${options.badge}
                        </span>
                      </td>
                      `
                          : ''
                      }
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style="padding: 32px 32px 28px 32px;">
                  <!-- Main Heading -->
                  <h1 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 700; color: #0F172A; letter-spacing: -0.4px; line-height: 1.3;">
                    ${options.heading}
                  </h1>

                  <!-- Subheading -->
                  ${
                    options.subheading
                      ? `
                  <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748B; line-height: 1.5;">
                    ${options.subheading}
                  </p>
                  `
                      : '<div style="margin-bottom: 20px;"></div>'
                  }

                  <!-- Content Area -->
                  <div style="font-size: 15px; color: #334155; line-height: 1.6;">
                    ${options.contentHtml}
                  </div>

                  <!-- Metadata List -->
                  ${metadataRowsHtml}

                  <!-- CTA Button -->
                  ${ctaButtonHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #475569;">
                    RentMate — Modern Smart Kost Management
                  </p>
                  <p style="margin: 0 0 12px 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                    ${options.footerNote || 'Email ini dikirimkan secara otomatis oleh sistem RentMate. Harap tidak membalas langsung ke alamat ini.'}
                  </p>
                  <div style="border-top: 1px solid #E2E8F0; margin: 12px 0; padding-top: 12px;">
                    <span style="font-size: 11px; color: #94A3B8;">
                      &copy; ${new Date().getFullYear()} RentMate. All rights reserved.
                    </span>
                  </div>
                </td>
              </tr>

            </table>
            <!-- End Container Card -->
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }
}
