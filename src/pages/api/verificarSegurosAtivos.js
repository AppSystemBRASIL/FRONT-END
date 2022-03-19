import firebase from '../../auth/AuthConfig';

import { format } from 'date-fns';

export default async function handler(req, res) {
  await firebase
  .firestore()
  .collection('seguros').where('ativo', '==', true)
  .get()
  .then((response) => {
    const array = [];
    const arrayCorretor = [];
    const arrayCorretora = [];

    if(!response.empty) {
      response.forEach((item) => {
        const data = item.data();

        if(data.corretor) {
          arrayCorretor.push(data.corretor.uid);
        }

        if(data.corretora) {
          arrayCorretora.push(data.corretora.uid);
        }

        array.push(data);
      })
    }

    arrayCorretor.map(async (item) => {
      const data = array.filter(e => e.corretor).filter(e => e.corretor.uid === item);

      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(item).set({
        total: data.length,
        valores: {
          comissao: data.reduce((accum, curr) => accum + curr.comissao.comissao, 0),
          premio: data.reduce((accum, curr) => accum + curr.comissao.premio, 0),
        }
      }, { merge: true });
    });

    arrayCorretora.map(async (item) => {
      const data = array.filter(e => e.corretora).filter(e => e.corretora.uid === item);

      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(item).set({
        total: data.length,
        valores: {
          comissao: data.reduce((accum, curr) => accum + curr.comissao.comissao, 0),
          premio: data.reduce((accum, curr) => accum + curr.comissao.premio, 0),
        }
      }, { merge: true });
    });
  });
  
  const date = new Date();

  const data = {
    [format(date, 'dd_MM_yyyy')]: format(date, 'hh:mm:ss')
  }

  await firebase
  .firestore()
  .collection('postback')
  .doc('githubActions')
  .set(data, { merge: true });

  res.status(200).json({
    success: true
  });
}
