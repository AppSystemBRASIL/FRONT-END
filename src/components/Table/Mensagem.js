import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Button,
  Empty,
  Badge,
  Modal,
} from 'antd';

import { FaPhoneAlt, FaPlus } from 'react-icons/fa';

import { format } from 'date-fns';

import _ from 'lodash';

const TableMensagem = ({ infiniteData, limit, corretora }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [seguradoras, setSeguradoras] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  const getCotacao = async () => {
    let ref = firebase.firestore()
    .collection('feedback')
    .where('corretora', '==', corretora)
    .orderBy('created');

    if((lastData !== 0)) {
      ref = ref.startAfter(lastData);
    }

    ref.limit(listLimitDefault)
    .onSnapshot((snap) => {
      setViewButtonMore(false);

      const array = [];

      if(!snap.empty) {
        snap.forEach((item) => {
          array.push({
            ...item.data(),
            uid: item.id
          });
        });
      }

      if(snap.docs[snap.docs.length-1]) {
        setLastData(snap.docs[snap.docs.length-1]);
      }

      setSeguradoras(array);

      if(array.length === (limit || listLimitDefault)) {
        setViewButtonMore(true);
      }
    });
    
    setLoadingData(true);
  }

  useEffect(() => {
    getCotacao();
  }, []);
  
  return (
    <>
      <Table
        dataSource={loadingData ? seguradoras.sort((a, b) => a.created + b.created) : _.times(listLimitDefault)}
        pagination={false}
        scroll={{ x: 'calc(100% - 0px)' }}
        locale={{
          emptyText: [
            <Empty 
              description={
                <h1 style={{color: 'gray'}}>
                  NENHUM REGISTRO ENCONTRADO
                </h1>
              }
            />
          ]
        }}
      >
        <Table.Column
          key="nome"
          dataIndex="nome"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                NOME
              </div>
            ]
          }
          render={(nome, dados) => (
            <>
              {!dados.lida && (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    Modal.confirm({
                      title: 'CONFIRMAR LEITURA?',
                      content: 'Deseja confirmar a leitura da mensagem?',
                      onOk: () => {
                        firebase.firestore().collection('feedback').doc(dados.uid).set({
                          lida: true,
                        }, { merge: true })
                      },
                      cancelText: 'FECHAR',
                      okText: 'CONFIRMAR'
                    })
                  }}
                >
                  <Badge count={'NÃO LIDO'} style={{ position: 'absolute', top: -30, left: -10, width: 70, fontSize: 10, margin: 0, padding: 0 }} />
                </span>
              )}
              {nome}
            </>
          )}
        />
        <Table.Column
          key="telefone"
          dataIndex="telefone"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                TELEFONE
              </div>
            ]
          }
          render={telefone => {
            const link = `https://wa.me/55${String(telefone).split('(').join('').split(')').join('').split(' ').join('').split('-').join('')}`;
            return !telefone ? '------------' : (
              <span style={{
                cursor: 'pointer'
              }} onClick={() => window.open(link)}>
                <FaPhoneAlt /> {telefone}
              </span>
            );
          }}
        />
        <Table.Column
          key="mensagem"
          dataIndex="mensagem"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                MENSAGEM
              </div>
            ]
          }
        />
        <Table.Column
          width={100}
          key="created"
          dataIndex="created"
          title={
            [
              <div style={{width: !loadingData && 70, height: !loadingData && 23}} className={!loadingData && 'skeleton'}>
                {loadingData && (
                  <center>
                    ENVIADO
                  </center>
                )}
              </div>
            ]
          }
          render={(created) => created && format(new Date(created.toDate()), 'dd/MM/yyyy')}
        />
      </Table>
      {(infiniteData === true && viewButtonMore === true) && (
        <center>
          <Button type='primary' onClick={() => getCotacao()} style={{
            display: 'flex',
            alignItems: 'center',
            margin: 10,
            fontWeight: 'bold'
          }}>
            MAIS SEGURADORAS <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableMensagem;