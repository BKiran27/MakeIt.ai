import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || 'mock-key', {
      apiVersion: '2025-01-27.accredited' as any,
    });
  }

  async createCheckoutSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: this.configService.get<string>('STRIPE_PRICE_ID') || 'price_123',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/billing`,
      customer_email: user.email,
      client_reference_id: userId,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId && subscriptionId && customerId) {
          const subscriptionDetails = await this.stripe.subscriptions.retrieve(subscriptionId);
          await this.prisma.$transaction([
            this.prisma.subscription.upsert({
              where: { userId },
              update: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status: subscriptionDetails.status,
                priceId: subscriptionDetails.items.data[0].price.id,
                currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
              },
              create: {
                userId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status: subscriptionDetails.status,
                priceId: subscriptionDetails.items.data[0].price.id,
                currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
              },
            }),
            this.prisma.user.update({
              where: { id: userId },
              data: { isPremium: true },
            }),
          ]);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const dbSub = await this.prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (dbSub) {
          await this.prisma.$transaction([
            this.prisma.subscription.update({
              where: { id: dbSub.id },
              data: { status: 'canceled' },
            }),
            this.prisma.user.update({
              where: { id: dbSub.userId },
              data: { isPremium: false },
            }),
          ]);
        }
        break;
      }
    }
    return { received: true };
  }
}
