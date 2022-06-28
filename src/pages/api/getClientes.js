import firebase from '../../auth/AuthConfig';

export default async function handler(req, res) {
  let ref = firebase.firestore().collection('seguros');

  const clientes = await ref.get()
  .then((response) => {
    const array = [];
    if(!response.empty) {
      response.forEach((item) => {
        const data = item.data();

        array.push({
          cpf: String(data.segurado.cpf).split('.').join('').split('-').join(''),
          nome: data.segurado?.nome || null,
          anoAdesao: Number(data.segurado.anoAdesao),
          telefone: data.segurado?.telefone || null,
          profissao: data.segurado?.profissao || null,
          corretora: 'X0hXIOdA5pOkyLquPIxj'
        });
      })
    }

    return array;
  })
  .catch((error) => {
    console.log(error);

    return [];
  });

  for(const item in clientes) {
    const data = clientes[item];

    if(!data.cpf) {
      return;
    }
    
    await firebase.firestore().collection('clientes').doc(data.cpf).set(data, { merge: true });
  }

  res.status(200).json({
    data: clientes
  });
}