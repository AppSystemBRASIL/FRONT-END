import firebase from '../../auth/AuthConfig';

import {
  Modal,
  notification
} from 'antd';

import colors from '../../utils/colors';

export default async function apagarCotacao(uid, setData) {
  Modal.confirm({
    title: 'DESEJA REALMENTE EXCLUIR A COTAÇÃO',
    width: window.screen.width > 768 ? '40%' : '100%',
    content: 'Lembrando que você não terá mais acesso a cotação e não existe a possibilidade desfazer a ação',
    okText: 'EXCLUIR',
    okButtonProps: {
      style: {
        background: colors.danger.default,
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        outline: 'none'
      }
    },
    cancelText: 'CANCELAR',
    onOk: async () => {
      return await firebase.firestore().collection('cotacoes').doc(uid).delete()
      .then(() => {
        Modal.destroyAll();

        notification.success({
          message: 'EXLCUÍDO COM SUCESSO!'
        });

        if(setData) {
          setData(response => response.filter(resp => resp.uid !== uid));
        }

        return true;
      })
      .catch(() => {
        notification.error({
          message: 'ERROR AO EXCLUIR'
        });

        return true;
      });
    }
  })
}