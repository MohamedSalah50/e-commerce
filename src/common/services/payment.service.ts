import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET as string);
    }

    async checkoutSession({
        customer_email,
        cancel_url = process.env.CANCEL_URL as string,
        success_url = process.env.SUCCESS_URL as string,
        metadata = {},
        discounts = [],
        mode = 'payment',
        line_items,
    }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            customer_email,
            cancel_url,
            success_url,
            metadata,
            discounts,
            mode,
            line_items,
        });

        return session;
    }

    async createCoupon(data: Stripe.CouponCreateParams): Promise<Stripe.Response<Stripe.Coupon>> {
        const coupon = await this.stripe.coupons.create(data);
        console.log(coupon);
        return coupon;

    }
    async webhook(req: Request): Promise<Stripe.CheckoutSessionCompletedEvent> {


        let event: Stripe.Event = this.stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'] as string,
            process.env.STRIPE_WEBHOOK_SECRET as string);

        if (event.type != 'checkout.session.completed') {
            throw new BadRequestException('fail to pay');
        }

        console.log({ event, metadata: event.data.object.metadata });

        return event



    }

    async paymentMethod(data: Stripe.PaymentMethodCreateParams): Promise<Stripe.Response<Stripe.PaymentMethod>> {
        const method = await this.stripe.paymentMethods.create(data);
        return method;
    }

    async paymentIntent(data: Stripe.PaymentIntentCreateParams): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const paymentIntent = await this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }

    async retriveIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
        return paymentIntent;
    }

    async confirmIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const intent = await this.retriveIntent(id);
        if (intent?.status != 'requires_confirmation') {
            throw new NotFoundException('fail to find matching intent');
        }
        const confirm = await this.stripe.paymentIntents.confirm(id);
        return confirm;
    }

    async refund(id: string): Promise<Stripe.Response<Stripe.Refund>> {
        const intent = await this.retriveIntent(id);
        if (intent?.status != 'succeeded') {
            throw new NotFoundException('fail to find matching intent');
        }
        const refund = await this.stripe.refunds.create({ payment_intent: intent.id });
        return refund;
    }



}