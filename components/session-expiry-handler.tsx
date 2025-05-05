'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Durée d'inactivité avant expiration (en millisecondes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function SessionExpiryHandler() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    setLastActivity(Date.now());
  };

  // Vérifier si la session a expiré côté serveur
  useEffect(() => {
    if (session && (session as any).expired) {
      // La session a expiré côté serveur, déconnecter l'utilisateur
      signOut({ redirect: true, callbackUrl: '/login' });
    }
  }, [session]);

  // Gérer l'expiration de session côté client basée sur l'inactivité
  useEffect(() => {
    // Événements à surveiller pour réinitialiser le timer d'inactivité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Vérifier l'inactivité toutes les minutes
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;
      
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        // L'utilisateur est inactif depuis trop longtemps, déconnecter
        signOut({ redirect: true, callbackUrl: '/login' });
      } else {
        // Mettre à jour la session pour maintenir le token JWT à jour
        update();
      }
    }, 60000); // Vérifier chaque minute

    // Nettoyer les écouteurs d'événements et l'intervalle
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearInterval(intervalId);
    };
  }, [lastActivity, update]);

  // Ce composant ne rend rien visuellement
  return null;
}

export default SessionExpiryHandler;
