import firebase from '../../auth/AuthConfig';

import {
  Modal,
  notification
} from 'antd';

import colors from '../../utils/colors';

export default async function iniciarCotacao(uid) {
  Modal.confirm({
    title: 'DESEJA REALMENTE INICIAR A NEGOCIAÇÃO DA COTAÇÃO',
    width: window.screen.width > 768 ? '40%' : '100%',
    content: 'Lembrando que não existe a possibilidade desfazer a ação',
    okText: 'INICIAR',
    okButtonProps: {
      style: {
        background: colors.primary.default,
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        ouline: 'none'
      }
    },
    cancelText: 'CANCELAR',
    onOk: async () => {
      await firebase.firestore().collection('cotacoes').doc(uid).set({
        status: 1
      }, { merge: true })
      .then(() => {
        Modal.destroyAll();

        notification.success({
          message: 'NEGOCIAÇÃO INICIADA!',
        });
      })
      .catch(() => {
        notification.error({
          message: 'ERROR AO INICIAR NEGOCIAÇÃO'
        });
      });
    }
  })
}