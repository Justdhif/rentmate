import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly serverKey: string;
  private readonly clientKey: string;
  private readonly isProduction: boolean;
  private readonly snapBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
    this.isProduction =
      this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';

    this.snapBaseUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  }

  async createSnapTransaction(params: {
    orderId: string;
    grossAmount: number;
    customer: {
      firstName: string;
      email: string;
      phone?: string;
    };
    item: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    };
  }) {
    if (!this.serverKey) {
      throw new BadRequestException('MIDTRANS_SERVER_KEY is not configured');
    }

    const payload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      customer_details: {
        first_name: params.customer.firstName,
        email: params.customer.email,
        phone: params.customer.phone || '',
      },
      item_details: [
        {
          id: params.item.id,
          price: Math.round(params.item.price),
          quantity: params.item.quantity,
          name: params.item.name.substring(0, 50),
        },
      ],
      usage_limit: 1,
    };

    const authHeader = `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`;

    const response = await fetch(this.snapBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      this.logger.error('Midtrans Snap Error:', data);
      throw new BadRequestException(
        data.error_messages
          ? data.error_messages.join(', ')
          : 'Failed to create Midtrans Snap transaction',
      );
    }

    return {
      token: data.token as string,
      redirectUrl: data.redirect_url as string,
    };
  }

  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    const raw = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    const calculatedHash = crypto
      .createHash('sha512')
      .update(raw)
      .digest('hex');

    return calculatedHash.toLowerCase() === signatureKey.toLowerCase();
  }
}
