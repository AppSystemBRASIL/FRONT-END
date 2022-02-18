import { useEffect } from 'react';

import firebase from '../../auth/AuthConfig';
import ver from '../../components/Cotacao/pdf';

const verCOTACAO = (data) => {
  useEffect(() => {
    ver(data, 'href')
  }, []);

  return (
    <>

    </>
  );
}

export async function getServerSideProps(res) {
  const { query } = res;

  const uid = query.uid;
  let data = null;

  await firebase.firestore().collection('cotacoes').doc(uid).get()
  .then((response) => {
    if(response.exists) {
      data = response.data();
    }
  });

  if(data === null) {
    return {
      notFound: true
    };
  }

  delete data.created;

  return {
    props: data
  }
}


export default verCOTACAO;