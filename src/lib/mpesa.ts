export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
  throw new Error('Invalid Kenyan phone number');
}

export interface PayHeroResult {
  success: boolean;
  message?: string;
  CheckoutRequestID?: string;
}

export async function initiateStkPush(
  rawPhone: string,
  amount: number,
  orderId: number
): Promise<PayHeroResult> {
  const phone = normalizePhone(rawPhone);
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const channelId = process.env.PAYHERO_CHANNEL_ID;
  const authHeader = process.env.PAYHERO_BASIC_AUTH;

  if (!callbackUrl || !channelId || !authHeader) {
    throw new Error('Missing PayHero environment variables on the server.');
  }

  const payload = {
    amount: Math.ceil(amount),
    phone_number: phone,
    channel_id: parseInt(channelId, 10),
    provider: 'm-pesa',
    external_reference: `ORDER-${orderId}`,
    callback_url: callbackUrl,
  };

  const res = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(`PayHero STK push failed: ${data.message || JSON.stringify(data)}`);
  }

  return data;
}
