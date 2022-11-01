import firebase from '../../auth/AuthConfig';


export default async function handler(req, res) {
  const dados = await firebase.firestore().collection('seguros').get()
  .then(async (response) => {
    const array = [];

    response.forEach(item => {
      array.push({
        ...item.data(),
        uid: item.id
      });
    });

    /*
      for(const item of array) {
        if(item?.seguro?.vigencia) {
          await firebase.firestore().collection('seguros').doc(item.uid).update({
            seguro: {
              vigencia: utcToZonedTime(startOfDay(new Date(item.seguro.vigencia.seconds * 1000)), 'America/Sao_Paulo'),
              vigenciaFinal: utcToZonedTime(addYears(endOfDay(new Date(item.seguro.vigencia.seconds * 1000)), 1), 'America/Sao_Paulo'),
            }
          });
        }
      }
    */

    return array;
  })
  .catch(() => []);

  res.status(200).json(dados);
}