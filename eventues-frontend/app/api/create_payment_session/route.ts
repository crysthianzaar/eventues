import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, ticket_id, quantity, name, email, cpf, payment } = body;

    // Validate required fields
    if (!event_id || !ticket_id || !quantity || !name || !email || !cpf || !payment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend API to create payment session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create_payment_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id,
        ticket_id,
        quantity,
        name,
        email,
        cpf,
        payment_details: payment.method === 'pix' ? { method: 'pix' } : {
          card_number: payment.cardNumber.replace(/\s/g, ''),
          expiry_date: payment.expiryDate,
          cvv: payment.cvv,
          cardholder_name: payment.cardholderName,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment session');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
