import { useState } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Modal,
  notification,
} from 'antd';

export default async function vincularSeguro(dados) {
  await firebase.firestore().collection('cotacoes').doc(dados.uid).set({
    status: 2
  }, { merge: true }).then(() => {
    Modal.destroyAll();

    notification.success({
      message: 'SEGURO VINCULADO!'
    })
  });
}