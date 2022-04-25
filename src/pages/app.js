import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';

import firebase from '../auth/AuthConfig';

export default function  App({ corretora }) {
  const { corretor } = useRouter().query;

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let device = null;

    if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      device = 'IOS';
    }else if(userAgent.match(/Android/i)) {
      device = 'ANDROID';
    }

    if(!device) {
      alert('Acesse com seu celular!');
      return;
    }

    if(corretora && corretora.apps[device]) {
      const urlParams = new URLSearchParams(window.location.search);
      const corretoraUID = corretora.uid || null;
      const corretorUID = urlParams.get('corretor');

      window.location.href = corretora.apps[device];
    }else {
      alert('Ainda não temos um app para seu sistema operacional');
    }
  }, []);

  return (
    <Head>
      <title>{corretora.razao_social}</title>
      <link rel='icon' type='image/png' href={corretora.icon} sizes='192x192' />

      <meta property='og:title' content={corretora.razao_social} />
      <meta property='og:url' content={corretora.site} />
      <meta property='og:description' content='Seguros custam menos que você imagina' />
      <meta property='og:image' itemprop='image' content={corretora.icon}/>
      <meta property='og:image:width' content='300' />
      <meta property='og:image:height' content='300' />
      <meta property='og:type' content='website' />
      <meta property='og:locale' content='pt_BR' />
    </Head>
  );
}

export const getServerSideProps = async (context) => {
  const { req } = context;
  const nodeENV = process.env.NODE_ENV;

  const hostname = String(req.headers.host).split('https://').join('').split('http://').join('').split('www.').join('');

  const corretora = await firebase.firestore().collection('corretoras').where('site', '==', nodeENV === 'development' ? 'xcarcorretora.com.br' : hostname).get()
  .then((response) => {
    if(!response.empty) {
      const array = [];

      response.forEach((item) => {
        array.push(item.data());
      });

      return array[0];
    }else {
      return null;
    }
  })
  .catch(() => null);

  return {
    props: {
      corretora: {...corretora, created: new Date(corretora.created.toMillis()).getTime()},
    }
  }
}