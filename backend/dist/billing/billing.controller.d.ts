import { BillingService } from './billing.service';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    createCheckout(req: any): Promise<{
        url: any;
    }>;
    stripeWebhook(req: any, signature: string): Promise<{
        received: boolean;
    }>;
}
