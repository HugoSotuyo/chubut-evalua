
import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

const firebaseConfig = {
  credential: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
};


let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp(firebaseConfig);
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { directorId, newUserName } = await req.json();

    if (!directorId || !newUserName) {
      return NextResponse.json({ success: false, message: 'Missing directorId or newUserName' }, { status: 400 });
    }

    const userDoc = await db.collection('users').doc(directorId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, message: 'Director not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const tokens = userData?.fcmTokens || [];

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'Director has no tokens, no notification sent.' });
    }

    const message = {
      notification: {
        title: 'Nuevo Docente para Habilitar',
        body: `El docente ${newUserName} se ha registrado en tu escuela y necesita tu aprobación.`,
      },
      tokens: tokens,
    };

    const response = await getMessaging(adminApp).sendEachForMulticast(message);
    
    console.log('Successfully sent message:', response);
    
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
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
