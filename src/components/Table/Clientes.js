import { useState, useEffect, useRef } from 'react';

import firebase from '../../auth/AuthConfig';

import {
  Table,
  Empty,
  Badge,
  Modal,
  Input,
  Space,
  Button
} from 'antd';

import { SearchOutlined } from '@ant-design/icons';

import Highlighter from 'react-highlight-words';

import { FaPhoneAlt, FaPrint } from 'react-icons/fa';

import _ from 'lodash';
import { maskCPF } from 'hooks/mask';

import printListSeguros from 'components/PDF/Clientes';

const ClientesTable = ({ corretora }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [seguradoras, setSeguradoras] = useState([]);

  const [viewButtonMore, setViewButtonMore] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const [qtdCliente, setQtdCliente] = useState([]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Pesquisar por ${dataIndex}`}
          value={dataIndex === 'cpf' ? maskCPF(selectedKeys[0] || '') : selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{
              width: 90,
            }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Limpar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#FFC069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : text,
  });

  const getCotacao = async () => {
    let ref = firebase.firestore()
    .collection('clientes')
    .where('corretora', '==', corretora)
    .orderBy('anoAdesao', 'desc');

    ref.onSnapshot((snap) => {
      setViewButtonMore(false);
      
      const array = [];

      if(!snap.empty) {
        snap.forEach((item) => {
          array.push({
            ...item.data(),
            cpf: maskCPF(item.data().cpf || ''),
            uid: item.id
          });
        });
      }

      setQtdCliente(array);
      setSeguradoras(array);
    });
    
    setLoadingData(true);
  }

  useEffect(() => {
    getCotacao();
  }, []);

  if(!loadingData) {
    return <></>;
  }

  return (
    <>
      <Table
        onChange={(e, f, faaa, data) => {
          const dados = data.currentDataSource;

          setQtdCliente(dados);
        }}
        dataSource={loadingData ? seguradoras.sort((a, b) => a.anoAdesao + b.anoAdesao) : _.times(10)}
        pagination={{
          style: {
            marginRight: 15
          }
        }}
        title={() => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <h3>TOTAL: {String(qtdCliente.length).padStart(2, '0')}</h3>
            <Button
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => printListSeguros({ clientes: qtdCliente })}
            >
              <FaPrint style={{ marginRight: 10 }} /> Imprimir
            </Button>
          </div>
        )}
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
          {...getColumnSearchProps('nome')}
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                NOME
              </div>
            ]
          }
          width={400}
        />
        <Table.Column
          {...getColumnSearchProps('cpf')}
          key="cpf"
          dataIndex="cpf"
          title={
            [
              <div className={!loadingData && 'skeleton'}>
                CPF
              </div>
            ]
          }
          render={cpf => maskCPF(cpf || '')}
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
          width={200}
          key="anoAdesao"
          dataIndex="anoAdesao"
          align='center'
          defaultSortOrder='descend'
          sorter={(a, b) => a.anoAdesao - b.anoAdesao}
          title={
            [
              <div style={{width: !loadingData && 70, height: !loadingData && 23}} className={!loadingData && 'skeleton'}>
                {loadingData && (
                  <center>
                    ANO DE ADESÃO
                  </center>
                )}
              </div>
            ]
          }
        />
      </Table>
    </>
  )
}

export default ClientesTable;