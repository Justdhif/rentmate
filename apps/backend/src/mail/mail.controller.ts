import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto, TestMailDto } from './dto/send-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('verify')
  async verifyConnection() {
    try {
      await this.mailService.verifyConnection();
      return {
        success: true,
        message: 'Koneksi SMTP Gmail berhasil diverifikasi.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Koneksi SMTP gagal.',
        error: error.message,
      };
    }
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() dto: SendMailDto) {
    // Jika tidak diberikan HTML lengkap, otomatis gunakan template UI Web RentMate
    const isFullHtml = dto.html && dto.html.toLowerCase().includes('<html');

    if (!isFullHtml) {
      return this.mailService.sendBrandedMail({
        to: dto.to,
        subject: dto.subject,
        heading: dto.heading || dto.subject,
        badge: dto.badge || 'Pemberitahuan',
        contentHtml:
          dto.html ||
          (dto.text
            ? `<p style="margin: 0; line-height: 1.6;">${dto.text.replace(/\n/g, '<br/>')}</p>`
            : ''),
        ctaText: dto.ctaText,
        ctaUrl: dto.ctaUrl,
      });
    }

    return this.mailService.sendMail({
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    });
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestMail(@Body() dto: TestMailDto) {
    return this.mailService.sendTestMail(dto.to);
  }
}
