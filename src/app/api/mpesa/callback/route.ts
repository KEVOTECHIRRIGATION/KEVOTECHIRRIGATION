import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

interface CallbackItem {
  Name: string;
  Value?: string | number;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: { Item: CallbackItem[] };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Security Phase 1: Validate Webhook Secret to prevent spoofing
    if (secret !== process.env.MPESA_WEBHOOK_SECRET) {
      console.warn('Unauthorized PayHero webhook attempt detected.');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // PayHero wrapper might include ExternalReference directly
    const extRef = body.ExternalReference || body.external_reference;
    let orderIdMatch: number | null = null;
    
    if (extRef && typeof extRef === 'string' && extRef.startsWith('ORDER-')) {
      orderIdMatch = parseInt(extRef.split('-')[1], 10);
    }

    const callback: StkCallback = body?.Body?.stkCallback || body?.stkCallback || body;

    const CheckoutRequestID = callback.CheckoutRequestID || body.checkout_request_id;
    const ResultCode = callback.ResultCode ?? (body.status === 'Success' ? 0 : 1);

    if (ResultCode === 0) {
      const find = (name: string) =>
        callback.CallbackMetadata?.Item?.find((i: any) => i.Name === name)?.Value;

      const receiptNumber = find?.('MpesaReceiptNumber') || body.mpesa_receipt_number || body.receipt;

      if (orderIdMatch) {
        await db.query(
          `UPDATE orders SET status = 'COMPLETED', mpesa_receipt_number = $1 WHERE id = $2`,
          [receiptNumber ?? null, orderIdMatch]
        );
      } else if (CheckoutRequestID) {
        await db.query(
          `UPDATE orders SET status = 'COMPLETED', mpesa_receipt_number = $1 WHERE checkout_request_id = $2`,
          [receiptNumber ?? null, CheckoutRequestID]
        );
      }
    } else {
      if (orderIdMatch) {
        await db.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [orderIdMatch]);
      } else if (CheckoutRequestID) {
        await db.query(`UPDATE orders SET status = 'FAILED' WHERE checkout_request_id = $1`, [CheckoutRequestID]);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('PayHero callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}

