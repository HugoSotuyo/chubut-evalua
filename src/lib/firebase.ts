
"use client";

import { useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const messaging = (typeof window !== 'undefined') ? getMessaging(app) : null;

export const FirebaseMessagingProvider = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user && messaging) {
      
      const requestPermissionAndToken = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
            if (currentToken) {
              if (!user.fcmTokens || !user.fcmTokens.includes(currentToken)) {
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, {
                  fcmTokens: arrayUnion(currentToken)
                });
              }
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          } else {
            console.log('Unable to get permission to notify.');
          }
        } catch (error) {
          console.error('An error occurred while retrieving token. ', error);
        }
      };

      requestPermissionAndToken();

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user, toast]);

  return null;
};
