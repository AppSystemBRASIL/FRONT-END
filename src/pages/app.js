import { useEffect } from 'react';
import { useRouter } from 'next/router';

import firebase from '../auth/AuthConfig';

export default function  App() {
  const {
    corretora,
    corretor
  } = useRouter().query;

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let device = null;

    if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      device = 'IOS';
    }else if(userAgent.match(/Android/i)) {
      device = 'ANDROID';
    }

    (async () => {
      if(!device) {
        alert('Acesse com seu celular!');
        return;
      }

      const hostname = String(window.location.hostname).split('https://').join('').split('http://').join('').split('www.').join('');

      firebase.firestore().collection('corretoras').where('site', '==', hostname).get()
      .then((response) => {
        if(!response.empty) {
          const array = [];

          response.forEach((item) => {
            array.push(item.data());
          });

          const corretora = array[0];

          if(corretora.apps[device]) {
            const urlParams = new URLSearchParams(window.location.search);
            const corretora = urlParams.get('corretora');
            const corretor = urlParams.get('corretor');

            window.location.href = corretora.apps[device];
          }else {
            alert('Ainda não temos um app para seu sistema operacional');
          }
        }else {
          alert('Ainda não temos um app para seu sistema operacional');
        }
      });
    })();
  }, []);

  return null;
}