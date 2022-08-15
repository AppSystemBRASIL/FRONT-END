import { useEffect } from 'react';

import { endOfDay, startOfDay } from 'date-fns';

import generateToken from 'hooks/generateToken';

import printListSeguros from 'components/PDF/ListSeguros';

import firebase from '../../auth/AuthConfig';

export default function RelatorioComissoes({ corretor, corretora, ...props }) {
  const initial = new Date(Number(props.initial));
  const finish = new Date(Number(props.finish));

  useEffect(() => {
    firebase.firestore().collection('usuarios').doc(corretor).get()
    .then((response) => {
      const { displayName } = response.data();

      let ref = firebase.firestore().collection('seguros').where('ativo', '==', true);

      ref = ref.where('seguro.vigencia', '>=', startOfDay(new Date(initial)));
      ref = ref.where('seguro.vigencia', '<=', endOfDay(new Date(finish)));
      ref = ref.orderBy('seguro.vigencia', 'asc');
      ref = ref.where('corretor.uid', '==', corretor);

      ref.get()
      .then((snap) => {
        if(!snap.empty) {
          const array = [];

          snap.forEach((item) => {
            array.push({
              ...item.data(),
              uid: item.id
            });
          });
    
          const seguros = array;

          firebase.firestore().collection('corretoras').doc(corretora).get()
          .then((response) => {
            printListSeguros(seguros?.map(item => ({...item, key: generateToken() })).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())).sort((a, b) => a.seguro.vigenciaFinal - b.seguro.vigenciaFinal), response.data(), {
              date: [
                initial,
                finish,
                true
              ],
              corretor: displayName
            }, true, true);
          })
        }
      });
    });
  });

  return <></>;
}

export async function getServerSideProps(context) {
  const [corretora, corretor, initial, finish] = context.query.data.split('|');

  return {
    props: {
      corretora,
      corretor,
      initial,
      finish
    }
  }
}