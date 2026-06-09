"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma.service");
const stripe_1 = __importDefault(require("stripe"));
let BillingService = class BillingService {
    configService;
    prisma;
    stripe;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'mock-key', {
            apiVersion: '2025-01-27.accredited',
        });
    }
    async createCheckoutSession(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: this.configService.get('STRIPE_PRICE_ID') || 'price_123',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/billing`,
            customer_email: user.email,
            client_reference_id: userId,
        });
        return { url: session.url };
    }
    async handleWebhook(signature, rawBody) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.client_reference_id;
                const subscriptionId = session.subscription;
                const customerId = session.customer;
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
                const sub = event.data.object;
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map