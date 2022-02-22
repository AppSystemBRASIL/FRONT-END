import firebase from '../../auth/AuthConfig';

import {
  Modal,
  notification,
  Divider
} from 'antd';

import Seguro from '../../components/Seguro';

import colors from '../../utils/colors';

export default async function vincularSeguro(dados) {
  Modal.destroyAll();

  Modal.confirm({
    closabled: true,
    style: {
      top: 10,
    },
    title: [
      <center>
        <h2>{dados && dados.seguroVinculado ? 'SEGURO VINCULADO' : 'VINCULAR SEGURO A COTAÇÃO'}</h2>
        <Divider />
      </center>
    ],
    width: window.screen.width > 768 ? '40%' : '100%',
    icon: null,
    content: (dados.seguro.tipo === 'veicular' || dados.tipo === 'veicular') ? <Seguro dados={dados} /> : <></>,
    okText: 'VINCULAR',
    okButtonProps: {
      style: {
        background: colors.primary.default,
        fontWeight: 'bold',
        color: 'white',
        border: 'none',
        ouline: 'none',
        display: dados && dados.seguroVinculado && 'none'
      }
    },
    cancelText: dados && dados.seguroVinculado ? 'FECHAR' : 'CANCELAR',
    onOk: async () => {
      const finalVigencia = document.getElementById('seguroVinculado-finalVigencia').value;
      const seguradora = document.getElementById('seguroVinculado-seguradora').value;

      if(String(finalVigencia).length <= 9 || !seguradora) {
        notification.warn({
          message: 'PREENCHA OS CAMPOS OBRIGATÓRIOS!'
        })

        return;
      }

      const seguradoraParse = JSON.parse(seguradora);

      const dataFormated = {
        ...dados,
        seguro: {
          ...dados.seguro,
          vigencia: finalVigencia,

          //COLOCAR APÓLICE E CI
        },
        seguradora: seguradoraParse,
        created: new Date(),
      };

      delete dataFormated.status;

      return await firebase.firestore().collection('seguros').doc(dados.uid).set(dataFormated, { merge: true })
      .then(async () => {
        await firebase.firestore().collection('cotacoes').doc(dados.uid).set({
          status: 2
        }, { merge: true })

        Modal.destroyAll();

        notification.success({
          message: 'SEGURO VINCULADO!'
        })
        return true;
      })
      .catch(() => {
        notification.error({
          message: 'ERROR AO VINCULAR SEGURO'
        });
        return true;
      });
    }
  })
}