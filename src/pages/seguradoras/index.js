import firebase from '../../auth/AuthConfig';

export default function Seguradoras({ data }) {
  return (
    <pre>
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}

export async function getServerSideProps(req, res) {
  const dados = await firebase.firestore().collection('seguradoras').get()
  .then((response) => {
    const array = [];

    response.forEach(item => {
      array.push({
        nome: item.data().razao_social,
        contatos: item.data().contatos
      })
    });

    return array.sort((a, b) => a.nome.localeCompare(b.nome));
  })
  .catch(() => []);

  return {
    props: {
      data: dados
    }
  }
}