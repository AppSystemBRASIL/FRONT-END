import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider, InputNumber } from 'antd';

import TableCorretores from '../../components/Table/Corretores';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskPlaca, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaTimes } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import generateToken from 'hooks/generateToken';
import { addYears, endOfDay, format, setHours, setMinutes } from 'date-fns';
import axios from 'axios';
import printListSeguros from 'components/PDF/ListSeguros';

import { useTheme } from 'styled-components';
import { validarCelular, validarPlaca, validateCPF } from 'hooks/validate';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  const theme = useTheme();

  const [width, setwidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setwidth(window.screen.width);
  }, []);

  const [cpf, setCPF] = useState('');
  const [placa, setPlaca] = useState('');

  const [seguradora, setSeguradora] = useState(null);
  const [corretor, setCorretor] = useState(null);

  const [date, setDate] = useState(null);

  const [viewNewSeguro, setViewNewSeguro] = useState(false);

  const [seguros, setSeguros] = useState([]);

  const [dataNewSeguro, setDataNewSeguro] = useState({
    bairro: null,
    cidade: null,
    estado: null,
    cep: null,
    parcelas: [
      { min: 0, max: 0, percentual: 0 }
    ]
  })

  useEffect(() => {
    if(String(dataNewSeguro.cep).length === 9) {
      axios.get(`https://viacep.com.br/ws/${String(dataNewSeguro.cep).split('-').join('')}/json`, {
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
      })
      .then((response) => {
        const data = response.data;

        setDataNewSeguro(e => ({...e, bairro: data.bairro, cidade: data.localidade, estado: data.uf}))
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }, [dataNewSeguro.cep]);

  const salvarSeguro = () => {

  }

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='PRODUTORES'>
      <CardComponent>
        <Modal onOk={salvarSeguro} title='NOVO PRODUTOR' cancelText='FECHAR' okText='SALVAR' onCancel={() => setViewNewSeguro(false)} visible={viewNewSeguro} closable={() => setViewNewSeguro(false)} style={{ top: 10 }} width='50%' cancelButtonProps={{ style: { border: '1px solid black', outline: 'none', color: 'black' } }} okButtonProps={{ style: { background: theme.colors[businessInfo.layout.theme].primary, border: 'none' }}}>
          <Row gutter={[10, 20]}>
            <Col span={8}>
              <label>NOME:</label>
              <Input placeholder='NOME COMPLETO' />
            </Col>
            <Col span={8}>
              <label>EMAIL:</label>
              <Input placeholder='EXEMPLO@HOSPEDAGEM.COM' />
            </Col>
            <Col span={8}>
              <label>CELULAR:</label>
              <Input placeholder='(00) 00000-0000' />
            </Col>
          </Row>
          <br/>
          <Row gutter={[10, 0]}>
            <Col span={24}>
              <h3>COMISSAO: {dataNewSeguro.parcelas.length <= 4 && <FaPlus cursor='pointer' onClick={() => {
                if(dataNewSeguro.parcelas.length > 4) {
                  return
                }

                setDataNewSeguro(e => ({
                  ...e,
                  parcelas: [...e.parcelas, {
                    min: 0, max: 0, percentual: 0
                  }]
                }))
              }} />}</h3>
            </Col>
            <Col span={6} style={{ border: '1px solid #d1d1d1', textAlign: 'center' }}>
              PARCELAS
            </Col>
            <Col span={6} style={{ border: '1px solid #d1d1d1', textAlign: 'center' }}>
              PERCENTUAL
            </Col>
            <Col span={12} />
            {dataNewSeguro.parcelas?.map((item, index, data) => (
              <>
                <Col span={6} style={{ border: '1px solid #d1d1d1', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <InputNumber value={item.min} style={{ width: '40%' }}
                    max={100}
                    min={0}
                    onChange={(value) => {
                      data[index].min = value;
                      setDataNewSeguro(e => ({...e, parcelas: data }))
                    }}
                  /> - <InputNumber value={item.max} style={{ width: '40%' }}
                    max={100}
                    min={item.min + 1}
                    onChange={(value) => {
                      data[index].max = value;
                      setDataNewSeguro(e => ({...e, parcelas: data }))
                    }}
                  />
                </Col>
                <Col span={6} style={{ border: '1px solid #d1d1d1', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <InputNumber defaultValue={0} value={item.percentual} style={{ width: '40%' }}
                      max={100}
                      min={0}
                      onChange={(value) => {
                        data[index].percentual = value;
                        setDataNewSeguro(e => ({...e, parcelas: data }))
                      }}
                    /> <span style={{ marginLeft: 10 }}>%</span>
                </Col>
                <Col span={12} style={{ textAlign: 'left', display: 'flex', alignItems: 'center'}}>
                  {data.length > 1 && index >= 0 && <FaTimes cursor='pointer' color='red' onClick={() => {
                    setDataNewSeguro(e => ({...e, parcelas: data.filter(x => x !== item)}))
                  }} />}
                </Col>
              </>
            ))}
          </Row>
        </Modal>
        <Row
          style={{
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            position: 'relative'
          }}
        >
          <Col span={24}>
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>CORRETORES <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
          </Col>
        </Row>
        <TableCorretores
          seguradora={seguradora}
          corretor={corretor}
          date={date}
          cpf={cpf}
          placa={placa}
          user={user}
          infiniteData={true}
          corretora={corretora.uid}
          setSeguros={setSeguros}
          seguros={seguros}
          setViewNewSeguro={setViewNewSeguro}
          setDataNewSeguro={setDataNewSeguro}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;