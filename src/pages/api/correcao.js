import firebase from '../../auth/AuthConfig';


export default async function handler(req, res) {
  await firebase
  .firestore()
  .collection('seguros')
  .where('ativo', '==', true)
  .where('seguro.vigenciaFinal', '>=', new Date())
  .get()
  .then(async (response) => {
    response.forEach(item => {
      const dados = {
        ...item.data(),
        uid: item.id
      }

      firebase.firestore().collection('seguros').doc(item.id)
      .set({
        veiculo: {
          placaQuery: `${dados.veiculo.placa[3]}${dados.veiculo.placa[5]}${dados.veiculo.placa[6]}`
        }
      }, { merge: true })
      .then(() => {
        console.log(item.id);
      })
    })
  });
  
  res.status(200).json({
    success: true
  });
}
