import { useState, useEffect } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Empty,
  Button,
} from 'antd';
import {
  EyeOutlined
} from '@ant-design/icons';

import _ from 'lodash';
import { maskPhone } from 'hooks/mask';
import useAuth from 'hooks/useAuth';
import { useTheme } from 'styled-components';

const TableCorretores = ({ setView, setData }) => {
  const { businessInfo } = useAuth();

  const theme = useTheme();

  const [loadingData, setLoadingData] = useState(false);
  const [cotacoes, setCotacoes] = useState([]);

  const listLimitDefault = 10;

  useEffect(() => {
    getCotacao();
  }, []);

  const getCotacao = async (init) => {
    let ref = firebase.firestore()
    .collection('usuarios').where('tipo', '==', 'corretor');

    ref
    .onSnapshot((snap) => {
      const array = [];

      if(!snap.empty) {
        snap.forEach((item) => {
          array.push(item.data());
        });
      }

      setCotacoes(array);
    })
    
    setLoadingData(true);
  }
  
  return (
    <>
      <Table
        dataSource={loadingData ? cotacoes.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)) : _.times(listLimitDefault)}
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
          key="nomeCompleto"
          dataIndex="nomeCompleto"
          title={(
            <div className={!loadingData && 'skeleton'}>
              NOME
            </div>
          )}
          render={(nome) => (
            <div className={!loadingData && 'skeleton'}>
              {nome}
            </div>
          )}
        />
        <Table.Column
          key="email"
          dataIndex="email"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                EMAIL
              </div>
            ]
          }
          render={(email) => (
            <div className={!loadingData && 'skeleton'}>
              {email || '-----------------------------'}
            </div>
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
          render={(telefone) => telefone && (
            <div className={!loadingData && 'skeleton'}>
              {maskPhone(telefone)}
            </div>
          )}
        />
        <Table.Column
          key="comissao"
          dataIndex="comissao"
          title={(
            <center>
              <div className={!loadingData && 'skeleton'}>
                COMISSÃO
              </div>
            </center>
          )}
          render={(comissao) => (
            <center>
              <div className={!loadingData && 'skeleton'}>
                {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comissao)} %
              </div>
            </center>
          )}
        />
        <Table.Column 
          key="uid"
          dataIndex="uid"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                <center>AÇÃO</center>
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
                        onClick={async () => {
                          setData({
                            uid: dados?.uid,
                            cpf: dados?.cpf,
                            telefone: dados?.telefone,
                            nome: dados?.nomeCompleto,
                            email: dados?.email,
                            comissao: dados?.comissao,
                            banco: dados?.dadosBancarios?.banco,
                            agencia: dados?.dadosBancarios?.agencia,
                            agencia_d: dados?.dadosBancarios?.agencia_d,
                            conta: dados?.dadosBancarios?.conta,
                            conta_d: dados?.dadosBancarios?.conta_d,
                            pix: dados?.dadosBancarios?.pix,
                            status: dados?.status || false
                          });
                          
                          setView(true);
                        }}
                        style={{
                          border: 'none',
                          outline: 'none',
                          color: 'white',
                          background: theme.colors[businessInfo.layout.theme].primary
                        }}
                      >
                        <EyeOutlined />
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
      
    </>
  )
}

export default TableCorretores;