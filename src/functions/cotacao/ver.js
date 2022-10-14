import firebase from '../../auth/AuthConfig';

import {
  notification
} from 'antd';

import pdfSeguro from '../../components/Cotacao/pdf';


export default async function verSeguro(props) {
  const typeProps = typeof props;

  let data = {};

  if(typeProps !== 'object') {
    notification.open({
      message: 'AGUARDE...',
      description: 'ABRINDO PDF DO SEGURO'
    });

    await firebase.firestore().collection('cotacoes').doc(props).get()
    .then((response) => {
      if(response.exists) {
        data = response.data();
      }
    })
  }else {
    data = props;
  }

  if(data?.uid) {
    firebase.firestore().collection('seguros').doc(data?.uid).set({
      impresso: true
    }, { merge: true })
  }
  pdfSeguro(data);
}