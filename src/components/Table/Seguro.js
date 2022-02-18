import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Button,
  Empty
} from 'antd';

import { FaEye, FaPlus } from 'react-icons/fa';

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
          key="nomeCompleto"
          dataIndex="nomeCompleto"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                NOME
              </div>
            ]
          }
          render={(nomeCompleto, dados) => (
            <>
              {loadingData && (
                <span style={{ fontSize: '.6rem' }}>
                  SEGURO {dados.tipo.toUpperCase()} {(dados.tipo === 'veicular') && `- ${dados.placa}`}
                </span>
              )}
              <div className={!loadingData && 'skeleton'}>
                {nomeCompleto ? String(nomeCompleto) : '000000000'}
              </div>
            </>
          )}
        />
        <Table.Column
          key="celular"
          dataIndex="celular"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>CELULAR</center>
              </div>
            ]
          }
          render={(celular) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {celular ? celular : '00000000000'}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="finalVigencia"
          dataIndex="finalVigencia"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>VIGÊNCIA</center>
              </div>
            ]
          }
          render={(finalVigencia) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {finalVigencia ? finalVigencia : '00000000000'}
              </center>
            </div>
          )}
        />
        <Table.Column
          key="created"
          dataIndex="created"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>CRIADA</center>
              </div>
            ]
          }
          render={(created) => (
            <div className={!loadingData && 'skeleton'}>
              <center>
                {created ? format(new Date(created.toDate()), 'dd/MM/yyyy') : '00/00/0000'}
              </center>
            </div>
          )}
        />
        <Table.Column
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
                      <Button
                        type='primary'
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: 'none',
                          outline: 'none'
                        }}
                        onClick={() => verSeguro(dados)}
                      >
                        <FaEye />
                      </Button>
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