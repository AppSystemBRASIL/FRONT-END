import firebase from '../../auth/AuthConfig';

import { format, startOfDay } from 'date-fns';

export default async function handler(req, res) {
  await firebase
  .firestore()
  .collection('seguros')
  .where('ativo', '==', true)
  .where('seguro.vigenciaFinal', '<', new Date())
  .get()
  .then((response) => {
    if(!response.empty) {
      response.forEach((item) => {
        firebase.firestore().collection('seguros').doc(item.data().uid).set({
          ativo: false,
          cancelada: startOfDay(new Date())
        }, { merge: true });
      })
    }
  });

  await firebase
  .firestore()
  .collection('seguros')
  .where('ativo', '==', true)
  .where('seguro.vigenciaFinal', '>=', new Date())
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

      const premioValor = data.reduce((accum, curr) => accum + curr.valores.premio + curr.endossos.reduce((a, b) => a + b.valores.valor, 0), 0);
      const comissaoValor = data.reduce((accum, curr) => accum + curr.valores.comissao + curr.endossos.reduce((a, b) => a + b.valores.comissao, 0), 0);

      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretor').doc(item).set({
        total: data.length,
        valores: {
          premio: premioValor,
          comissao: comissaoValor,
        }
      }, { merge: true });
    });

    arrayCorretora.map(async (item) => {
      const data = array.filter(e => e.corretora).filter(e => e.corretora.uid === item);

      const premioValor = data.reduce((accum, curr) => accum + curr.valores.premio + curr.endossos.reduce((a, b) => a + b.valores.valor, 0), 0);
      const comissaoValor = data.reduce((accum, curr) => accum + curr.valores.comissao + curr.endossos.reduce((a, b) => a + b.valores.comissao, 0), 0);

      await firebase.firestore().collection('relatorios').doc('seguros').collection('corretora').doc(item).set({
        total: data.length,
        valores: {
          premio: premioValor,
          comissao: comissaoValor,
        }
      }, { merge: true });
    });
  });
  
  const date = new Date();

  await firebase
  .firestore()
  .collection('postback')
  .doc('githubActions')
  .set({
    [format(date, 'dd_MM_yyyy')]: format(date, 'hh:mm:ss')
  }, { merge: true });

  res.status(200).json({
    success: true
  });
}
