import firebase from '../../auth/AuthConfig';

export default async function handler(req, res) {
  const dados = await firebase.firestore().collection('seguradoras').get()
  .then((response) => {
    const array = [];

    response.forEach(item => {
      array.push(item.data());
    });

    return array.map(item => ({
      nome: item.razao_social,
      contatos: item.contatos
    }))
  })
  .catch(() => []);

  res.status(200).json(dados);
}