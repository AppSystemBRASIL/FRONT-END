import firebase from '../../auth/AuthConfig';

import pdfSeguro from '../../components/Seguro/pdf';

export default async function verSeguro(props) {
  const typeProps = typeof props;

  let data = {};

  if(typeProps !== 'object') {
    await firebase.firestore().collection('seguros').doc(props).get()
    .then((response) => {
      if(response.exists) {
        data = response.data();
      }
    })
  }else {
    data = props;
  }

  pdfSeguro(data);
}