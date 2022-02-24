import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification } from 'antd';

import TableSeguro from '../../components/Table/Seguro';

import { maskCPF, maskOnlyLetters } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import {
  
} from '../../hooks/mask'
import generateToken from 'hooks/generateToken';
import { addDays, addYears, format, setHours, setMinutes } from 'date-fns';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar } = useAuth();

  const [width, setwidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setwidth(window.screen.width);
  }, []);

  const [cpf, setCPF] = useState('');

  const [viewNewSeguro, setViewNewSeguro] = useState(false);

  const [dataNewSeguro, setDataNewSeguro] = useState({
    placa: null,
    vigencia: null,
    seguradora: null,
    cpf: null,
    nome: null,
    veiculo: null
  });

  useEffect(() => {
    setDataNewSeguro({
      placa: null,
      vigencia: null,
      seguradora: null,
      cpf: null,
      nome: null,
      veiculo: null
    })
  }, [viewNewSeguro]);

  useEffect(() => {
    if(dataNewSeguro.placa && dataNewSeguro.placa.length >= 7) {
      firebase.firestore().collection('seguros').where('veiculo.placa', '==', dataNewSeguro.placa).orderBy('created', 'desc').limit(1).get()
      .then((response) => {
        const array = [];
        
        if(!response.empty) {
          response.forEach((item) => {
            array.push(item.data());
          });
        }

        if(array.length > 0) {
          setDataNewSeguro(e => ({
            placa: array[array.length - 1].veiculo.placa,
            //vigencia: array[array.length - 1].seguro.vigencia,
            //seguradora: array[array.length - 1].seguradora.uid,
            cpf: array[array.length - 1].segurado.cpf,
            nome: array[array.length - 1].segurado.nome,
            veiculo: array[array.length - 1].veiculo.veiculo
          }));
        }
      });
    }
  }, [dataNewSeguro.placa])

  const [seguradoras, setSeguradoras] = useState([]);

  useEffect(() => {
    firebase.firestore().collection('seguradoras').get()
    .then((response) => {
      const array = [];

      if(!response.empty) {
        response.forEach(item => {
          array.push(item.data());
        })
      }

      setSeguradoras(array);
    })
  }, []);

  const salvarSeguro = async () => {
    if(!dataNewSeguro.seguradora || !dataNewSeguro.vigencia || !dataNewSeguro.nome || !dataNewSeguro.cpf || !dataNewSeguro.veiculo) {
      notification.warn({
        message: 'PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS!'
      });

      return;
    }
    
    const data = {
      seguradora: {
        uid: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].uid,
        razao_social: seguradoras.filter(x => x.uid === dataNewSeguro.seguradora)[0].razao_social,
      },
      veiculo: {
        veiculo: dataNewSeguro.veiculo,
        placa: dataNewSeguro.placa,
      },
      seguro: {
        vigencia: format(addYears(dataNewSeguro.vigencia.toDate(), 1), 'dd/MM/yyyy'),
        vigenciaToDate: addDays(setMinutes(setHours(addYears(dataNewSeguro.vigencia.toDate(), 1), 0), 0), 1),
      },
      segurado: {
        nome: dataNewSeguro.nome,
        cpf: dataNewSeguro.cpf,
      },
      corretora: {
        uid: corretora.uid,
        razao_social: corretora.razao_social
      },
      corretor: {
        nome: user.nomeCompleto,
        uid: user.uid
      },
      uid: generateToken(),
      created: new Date(),
      tipo: 'veicular'
    };

    await firebase.firestore().collection('seguros').doc(data.uid).set({
      ...data
    }, { merge: true })
    .then(() => {
      notification.success({
        message: 'SEGURO CADASTRADO COM SUCESSO!',
      });

      setViewNewSeguro(false);
    })
    .catch(() => {
      notification.error({
        message: 'OCORREU UM ERRO AO CADASTRAR!'
      })
    });
  }

  return (
    <LayoutAdmin title='SEGUROS'>
      <CardComponent>
        <Modal onOk={salvarSeguro} title='NOVO SEGURO' cancelText='FECHAR' okText='SALVAR' onCancel={() => setViewNewSeguro(false)} visible={viewNewSeguro} closable={() => setViewNewSeguro(false)}>
          <div>
            <label>PLACA: </label>
            <Input value={dataNewSeguro.placa} maxLength={7} style={{ textTransform: 'uppercase' }} onChange={(response) => setDataNewSeguro(e => ({...e, placa: String(response.target.value).toUpperCase()}))} onKeyPress={(e) => {
              if(e.code === 'Enter') {
                document.getElementById('seguradora').focus()
              }
            }} placeholder='PLACA' />
          </div>
          <br/>
          <div>
            <label>SEGURADORA: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Select placeholder='Selecionar Seguradora' id='seguradora' style={{ width: '100%' }} onChange={response => {
              setDataNewSeguro(e => ({...e, seguradora: response }));
              document.getElementById('inicioVigencia').focus()
            }}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            value={dataNewSeguro.seguradora}
            >
              {seguradoras?.map((item, index) => (
                <Select.Option key={index} value={item.uid}>
                  {item.razao_social}
                </Select.Option>
              ))}
            </Select>
          </div>
          <br/>
          <div>
            <label>INICIO VIGÊNCIA: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <DatePicker 
              id='inicioVigencia' format='DD/MM/yyyy' style={{ width: '100%' }}
              onChange={(e) => setDataNewSeguro(response => ({...response, vigencia: e}))}
              value={dataNewSeguro.vigencia}
              onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('nomeSegurado').focus()
                }
              }
            } onSelect={() => {
              document.getElementById('nomeSegurado').focus()
            }} />
          </div>
          <br/>
          <div>
            <label>NOME: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input id='nomeSegurado' style={{ textTransform: 'uppercase' }} placeholder='NOME DO SEGURADO'
              onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('cpfSeguro').focus()
                }
              }}
              value={dataNewSeguro.nome}
              onChange={(e) => setDataNewSeguro(response => ({...response, nome: maskOnlyLetters(String(e.target.value).toUpperCase())}))}
            />  
          </div>
          <br/>
          <div>
            <label>CPF: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input id='cpfSeguro' placeholder='NOME DO SEGURADO'
              onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  document.getElementById('veiculoSeguro').focus()
                }
              }}
              value={dataNewSeguro.cpf}
              onChange={(e) => setDataNewSeguro(response => ({...response, cpf: maskCPF(e.target.value)}))}
            />
          </div>
          <br/>
          <div>
            <label>VEÍCULO: <sup><span style={{ color: 'red' }}>*</span></sup></label>
            <Input id='veiculoSeguro' placeholder='NOME DO SEGURADO'
              onKeyPress={(e) => {
                if(e.code === 'Enter') {
                  //
                }
              }}
              value={dataNewSeguro.veiculo}
              onChange={(e) => setDataNewSeguro(response => ({...response, veiculo: String(e.target.value).toUpperCase()}))}  
            />
          </div>
        </Modal>
        <Row
          style={{
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
          }}
        >
          <Col sm={24} md={12}
            style={{
              display: 'flex', 
              alignItems: 'center',
            }}
          >
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>SEGUROS <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
          </Col>
          <Col xs={24} md={12}
            style={{
              display: width > 768 && 'flex',
              alignItems: width > 768 && 'center',
              flexDirection: width > 768 && 'row',
              justifyContent: width > 768 && 'end'
            }}
          >
            <div style={{ marginRight: 10 }}>
              <div style={{ width: '100%' }}>FILTRO POR CPF:</div>
              <Input style={{ width: '100%' }} type='tel' value={cpf} placeholder='000.000.000-00' onChange={(e) => setCPF(maskCPF(e.target.value))} />
            </div>
          </Col>
        </Row>
        <TableSeguro cpf={cpf} infiniteData={true} />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;