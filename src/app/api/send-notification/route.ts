
import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, applicationDefault } from 'firebase-admin/app';

// Correctly initialize Firebase Admin SDK
// This pattern ensures it's initialized only once.
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // This is crucial for authentication
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  console.log("Notification API endpoint hit.");

  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { directorId, newUserName } = await req.json();
    console.log(`Received request to notify directorId: ${directorId} about new user: ${newUserName}`);

    if (!directorId || !newUserName) {
      return NextResponse.json({ success: false, message: 'Missing directorId or newUserName' }, { status: 400 });
    }

    const userDoc = await db.collection('users').doc(directorId).get();

    if (!userDoc.exists) {
      console.error(`Director with ID ${directorId} not found in Firestore.`);
      return NextResponse.json({ success: false, message: 'Director not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const tokens = userData?.fcmTokens || [];
    console.log(`Found director: ${userData?.name}. FCM Tokens: ${tokens.length > 0 ? tokens : 'none'}`);

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

    console.log("Attempting to send notification via FCM...");
    const response = await getMessaging().sendEachForMulticast(message);
    
    console.log('Successfully sent message:', response);
    
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
    console.error('Error sending notification:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
