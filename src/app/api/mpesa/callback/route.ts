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
    const callback: StkCallback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      const find = (name: string) =>
        CallbackMetadata.Item.find((i) => i.Name === name)?.Value;

      const receiptNumber = find('MpesaReceiptNumber') as string | undefined;

      await db.query(
        `UPDATE orders
         SET status = 'COMPLETED', mpesa_receipt_number = $1
         WHERE checkout_request_id = $2`,
        [receiptNumber ?? null, CheckoutRequestID]
      );
    } else {
      await db.query(
        `UPDATE orders SET status = 'FAILED' WHERE checkout_request_id = $1`,
        [CheckoutRequestID]
      );
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
