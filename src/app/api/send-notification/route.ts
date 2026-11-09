import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('Notification API endpoint hit.');

  try {
    const { directorId, newUserName } = await req.json();
    console.log(`Received request to notify directorId: ${directorId} about new user: ${newUserName}`);

    if (!directorId || !newUserName) {
      return NextResponse.json({ success: false, message: 'Missing directorId or newUserName' }, { status: 400 });
    }

    // Import dinámico: firebase-admin solo se carga cuando llega una petición real,
    // no durante el build de Vercel. Esto evita el error "reading prototype".
    const { initializeApp, getApps, applicationDefault } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getMessaging } = await import('firebase-admin/messaging');

    if (!getApps().length) {
      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }

    const db = getFirestore();
    const messaging = getMessaging();

    const userDoc = await db.collection('users').doc(directorId).get();

    if (!userDoc.exists) {
      console.error(`Director with ID ${directorId} not found in Firestore.`);
      return NextResponse.json({ success: false, message: 'Director not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const tokens = userData?.fcmTokens || [];
    console.log(`Found director: ${userData?.name}, FCM Tokens: ${tokens.length > 0 ? tokens : 'none'}`);

    if (tokens.length === 0) {
      console.log(`Director ${directorId} has no FCM tokens. No notification sent.`);
      return NextResponse.json({ success: true, message: 'Director has no tokens, no notification sent.' });
    }

    const message = {
      notification: {
        title: 'Nuevo Docente para Habilitar',
        body: `El docente ${newUserName} se ha registrado en tu escuela y necesita tu aprobación.`,
      },
      tokens: tokens,
    };

    console.log('Attempting to send notification via FCM...');
    const response = await messaging.sendEachForMulticast(message);

    console.log('Successfully sent messages', response);

    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
      console.log('List of tokens that caused failures: ' + failedTokens);
    }

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });

  } catch (error) {
    console.error('Error sending notification', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
