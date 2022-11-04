import { addYears, endOfDay, startOfDay, subDays } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
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

    for(const item of array) {
      const timestamp = startOfDay(new Date(item.seguro.vigencia.seconds * 1000));
      const date = subDays(new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate()), 1);

      const start = zonedTimeToUtc(startOfDay(date), 'America/Sao_Paulo');
      const end = zonedTimeToUtc(addYears(endOfDay(date), 1), 'America/Sao_Paulo');

      await firebase.firestore().collection('seguros').doc(item.uid).update({
        seguro: {
          vigencia: start,
          vigenciaFinal: end,
        }
      });
    }

    return array;
  })
  .catch(() => []);

  res.status(200).json(dados);
}