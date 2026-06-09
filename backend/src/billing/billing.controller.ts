import { Controller, Post, UseGuards, Req, Headers, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(@Req() req: any) {
    return this.billingService.createCheckoutSession(req.user.id);
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe Signature');
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body not available. Ensure rawBody: true is set in nest CLI.');
    }
    return this.billingService.handleWebhook(signature, rawBody);
  }
}
