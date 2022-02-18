import firebase from '../../auth/AuthConfig';

import {
  Modal,
  notification
} from 'antd';

import { vincularSeguro } from '../../functions';

import colors from '../../utils/colors';

export default async function concluirCotacao(dados) {
  Modal.confirm({
    title: 'DESEJA REALMENTE CONCLUIR A COTAÇÃO',
    width: window.screen.width > 768 ? '40%' : '100%',
    content: 'Lembrando que não existe a possibilidade desfazer a ação',
    okText: 'CONCLUIR',
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
      return await firebase.firestore().collection('cotacoes').doc(dados.uid).set({
        status: 2
      }, { merge: true })
      .then(() => {
        Modal.destroyAll();

        vincularSeguro(dados);

        notification.success({
          message: 'COTAÇÃO CONCLUÍDA!'
        });
        return true;
      })
      .catch(() => {
        notification.error({
          message: 'ERROR AO CONCLUIR COTAÇÃO'
        });
        return true;
      });
    }
  })
}