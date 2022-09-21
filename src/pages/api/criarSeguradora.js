import firebase from '../../auth/AuthConfig';

export default async function handler(req, res) {
  const razao_social = 'YOUSE SEGURADORA';
  const contatos = [
    {
      setor: 'GUINCHO / SINISTRO / VIDROS (ASSISTÊNCIA 24H)',
      telefones: [
        {
          locais: 'Capitais e Regiões Metropolitanas',
          telefone: '3003 5770'
        },
        {
          locais: 'Todas as regiões',
          telefone: '0800 730 9901'
        },
      ]
    },
    {
      setor: 'OUVIDORIA',
      telefones: [
        {
          locais: 'Todas as regiões',
          telefone: '0800 730 9991'
        },
      ]
    },
    {
      setor: 'SAC',
      telefones: [
        {
          locais: 'Todas as regiões',
          telefone: '0800 730 9903'
        },
      ]
    },
    {
      setor: 'ATENDIMENTO EXCLUSIVO PARA DEFICIENTES AUDITIVOS',
      telefones: [
        {
          locais: 'Todas as regiões',
          telefone: '0800 730 9904'
        },
      ]
    }
  ];

  await firebase.firestore().collection('seguradoras').add({
    razao_social,
    created: new Date(),
    contatos
  })
  .then(async ({ id }) => {
    await firebase.firestore().collection('seguradoras').doc(id).update({
      uid: id
    })
  })

  res.status(200).json({
    success: true
  });
}