import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Button,
  Empty,
  Dropdown,
  Menu,
  Tag,
  Modal
} from 'antd';

import { FaEye, FaPlus, FaTimes } from 'react-icons/fa';
import {
  DownOutlined
} from '@ant-design/icons'

import _ from 'lodash';
import { format } from 'date-fns';

import { verSeguro } from '../../functions';

const TableSeguro = ({ infiniteData, limit, cpf }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [seguros, setSeguros] = useState([]);

  const [lastData, setLastData] = useState(0);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const listLimitDefault = 10;

  useEffect(() => {
    (async () => {
      if(cpf === undefined || (cpf.length === 14 || cpf.length === 0)) {
        await setLastData(0);
        await setSeguros([]);
        getCotacao('init');
      }
    })();
  }, [cpf]);

  const getCotacao = async (init) => {
    let ref = firebase.firestore()
    .collection('seguros');

    ref = ref.orderBy('created', 'desc');

    if(cpf !== undefined && cpf.length === 14) {
      ref = ref.where('usuario.cpf', '==', cpf);
    }else if((!init && lastData !== 0)) {
      ref = ref.startAfter(lastData);
    }

    ref.limit(cpf !== undefined && cpf.length === 14 ? 10000 : limit || listLimitDefault)
    .onSnapshot((snap) => {
      setViewButtonMore(false);

      const array = [];

      if(!snap.empty) {
        snap.forEach((item) => {
          array.push(item.data());
        });
      }

      if(snap.docs[snap.docs.length-1]) {
        setLastData(snap.docs[snap.docs.length-1]);
      }

      setSeguros(response => {
        const objetos = [...response];

        array.map((item) => {
          const index = objetos.findIndex(resp => resp.uid === item.uid);
          if(index >= 0) {
            objetos[index] = item;
          }else {
            objetos.push(item);
          }
        });

        return objetos;
      });

      if(array.length === (limit || listLimitDefault)) {
        setViewButtonMore(true);
      }
    })
    
    setLoadingData(true);
  }

  const cancelarSeguro = (uid) => {
    Modal.confirm({
      title: 'DESEJA REALMENTE CANCELAR O SEGURO?',
      content: 'Ao confirmar a ação não será possível desfazer a mesma',
      onOk: () => {
        firebase.firestore().collection('seguros').doc(uid).set({
          status: 'cancelado'
        }, { merge: true });
      },
      okText: 'CONFIRMAR',
      cancelText: 'FECHAR'
    })
  }
  
  return (
    <>
      <Table
        dataSource={loadingData ? seguros : _.times(listLimitDefault)}
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
          width={300}
          key="segurado"
          dataIndex="segurado"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                SEGURADO
              </div>
            ]
          }
          render={(segurado, dados) => (
            <>
              {(dados.status === 'cancelado' || dados.seguro.vigenciaToDate >= new Date()) && (
                <Tag color='red' style={{ position: 'absolute', top: -7, left: 0, fontSize: '.5rem', padding: 1, margin: 0 }}>
                  CANCELADO
                </Tag>
              )}
              {loadingData && (
                <span style={{ fontSize: '.6rem' }}>
                  SEGURO {dados.tipo.toUpperCase()} {(dados.tipo === 'veicular') && `- ${dados.veiculo.placa}`}
                </span>
              )}
              <div className={!loadingData && 'skeleton'}>
                {segurado ? String(segurado.nome) : '000000000'}
              </div>
            </>
          )}
        />
        <Table.Column
          key="veiculo"
          dataIndex="veiculo"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>PLACA</center>
              </div>
            ]
          }
          render={(veiculo) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {veiculo ? veiculo.placa : 'A AVISAR'}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="segurado"
          dataIndex="segurado"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>CELULAR</center>
              </div>
            ]
          }
          render={(segurado) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {segurado ? segurado.celular : '00000000000'}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="seguro"
          dataIndex="seguro"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>VIGÊNCIA</center>
              </div>
            ]
          }
          render={(seguro) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {seguro ? seguro.vigencia : '00000000000'}
              </center>
            </div>
          )}
        />
        <Table.Column
          width={200}
          key="uid"
          dataIndex="uid"
          title={
            [
              <div style={{width: !loadingData && 70, height: !loadingData && 23}} className={!loadingData && 'skeleton'}>
                {loadingData && (
                  <center>
                    AÇÃO
                  </center>
                )}
              </div>
            ]
          }
          render={(uid, dados) => (
            <>
              {!uid ? (
                <div className='skeleton' style={{ width: 70, height: 23 }} />
              ) : (
                <>
                  {loadingData ? (
                    <div
                      className={!loadingData && 'skeleton'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                    >
                      <Dropdown overlay={() => (
                        <Menu>
                          <Menu.Item icon={<FaEye />} onClick={() => verSeguro(dados)}>
                            VER SEGURO
                          </Menu.Item>
                          <Menu.Item icon={<FaTimes />} onClick={() => cancelarSeguro(dados.uid)}>
                            CANCELAR SEGURO
                          </Menu.Item>
                        </Menu>
                      )}>
                        <Button block>
                          OPÇÕES <DownOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  ) : (
                    <div className='skeleton' style={{ width: 70, height: 23 }} />
                  )}
                </>
              )}
            </>
          )}
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
            MAIS SEGUROS <FaPlus style={{ marginLeft: 5 }} />
          </Button>
        </center>
      )}
    </>
  )
}

export default TableSeguro;