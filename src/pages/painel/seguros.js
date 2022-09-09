import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, DatePicker, Select, Divider } from 'antd';

import TableSeguro from '../../components/Table/Seguro';

import { maskCPF, maskOnlyLetters, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaPrint } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import printListSeguros from 'components/PDF/ListSeguros';

import ModalSeguro from 'components/Modal/seguro';
import generateToken from 'hooks/generateToken';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  const [width, setwidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setwidth(window.screen.width);
  }, []);

  const [cpf, setCPF] = useState('');
  const [placa, setPlaca] = useState('');
  const [placaPremiada, setPlacaPremiada] = useState('');

  const [anoAdesao, setAnoAdesao] = useState('');
  const [segurado, setSegurado] = useState('');

  const [seguradora, setSeguradora] = useState(null);
  const [corretor, setCorretor] = useState(null);

  const [date, setDate] = useState(null);

  const [viewNewSeguro, setViewNewSeguro] = useState(false);

  const [seguros, setSeguros] = useState([]);

  const [valoresIniciais, setValoresIniciais] = useState({
    seguros: 0,
    totalPremio: 0,
    totalComissao: 0,
  });

  useEffect(() => {
    if(user) {
      firebase.firestore().collection('relatorios').doc('seguros').collection(user.tipo !== 'corretor' ? 'corretora' : 'corretor').doc(user.tipo !== 'corretor' ? user.corretora.uid : user.uid).onSnapshot((response) => {
        if(response.exists) {
          const data = response.data();
  
          setValoresIniciais({
            seguros: data.total,
            totalPremio: data.valores.premio,
            totalComissao: data.valores.comissao,
          });
        }
      })
    }
  }, [user]);

  const [seguradoras, setSeguradoras] = useState([]);
  const [corretores, setCorretores] = useState([]);

  useEffect(() => {
    if(user) {
      if(user.tipo === 'corretor') {
        setCorretor(user.uid);
      }

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

      firebase.firestore().collection('usuarios').where('corretora.uid', '==', user.corretora.uid).where('tipo', '==', 'corretor').get()
      .then((response) => {
        const array = [];

        if(!response.empty) {
          response.forEach(item => {
            array.push(item.data());
          })
        }

        setCorretores(array);
      })
    }
  }, [user]);

  const printSeguros = async () => await printListSeguros(seguros?.map(item => ({...item, key: generateToken() })).sort((a, b) => a.segurado.nome.toLowerCase().localeCompare(b.segurado.nome.toLowerCase())).sort((a, b) => a.seguro.vigenciaFinal - b.seguro.vigenciaFinal), corretora, {
    date,
    corretor: !corretor ? null : corretor === 'null' ? corretora.razao_social : corretores.filter(e => e.uid === corretor)[0].displayName,
    seguradora: !seguradora ? null : seguradoras.filter(e => e.uid === seguradora)[0].razao_social.split(' ')[0],
    placa,
    cpf
  });

  const verifyFilter = !date && !corretor && !seguradora && (!placa && !cpf);

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='SEGUROS'>
      <CardComponent>
        <ModalSeguro visible={viewNewSeguro} setVisible={setViewNewSeguro} />
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
          {(date && seguros.length > 0) && (
            <span
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                zIndex: 1
              }}
              onClick={printSeguros}
            >
              <FaPrint style={{ marginRight: 5 }} /> IMPRIMIR
            </span>
          )}
          <Col span={24}>
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center', marginBottom: 10}}>SEGUROS <sup><FaPlus style={{ cursor: 'pointer' }} onClick={() => setViewNewSeguro(true)} /></sup></h1>
          </Col>
          {(user.tipo === 'administrador' || user.tipo === 'gestor') && (
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '30%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5 }}>TOTAL DE SEGUROS:<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{String(verifyFilter ? valoresIniciais.seguros : seguros.length).padStart(2, '0')}</span></div>
              <div style={{ width: '70%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div>
                  TOTAL EM PRÊMIO LÍQUIDO<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{Number(verifyFilter ? valoresIniciais.totalPremio : seguros.reduce((a, b) => a + b.valores.premio, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                <div>
                  MÉDIA DO PRÊMIO LÍQUIDO<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number((valoresIniciais.totalPremio / valoresIniciais.seguros) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : !seguros.length > 0 ? 'R$ 0,00' : Number(seguros.reduce((a, b) => a + b.valores.premio, 0) / seguros.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
              <div style={{ width: '100%', background: '#fff', border: '1px solid rgba(0, 0, 0, .2)', padding: '10px 0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div>
                  TOTAL DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{Number(verifyFilter ? valoresIniciais.totalComissao : seguros.reduce((a, b) => a + b.valores.comissao, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                <div>
                  VALOR MÉDIO DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number((valoresIniciais.totalComissao / valoresIniciais.seguros) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : !seguros.length > 0 ? 'R$ 0,00' : Number(seguros.reduce((a, b) => a + b.valores.comissao, 0) / seguros.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <Divider style={{ borderColor: 'rgba(0, 0, 0, .2)' }} type='vertical' />
                <div>
                  MÉDIA DAS COMISSÕES<br/><span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444' }}>{verifyFilter ? Number(((valoresIniciais.totalComissao / valoresIniciais.totalPremio) * 100) || 0).toFixed(2).split('.').join(',') : !seguros.length > 0 ? 0 : Number((seguros.reduce((a, b) => a + b.valores.comissao, 0) / seguros.reduce((a, b) => a + b.valores.premio, 0)) * 100).toFixed(2).split('.').join(',')}%</span>
                </div>
              </div>
            </Col>
          )}
          <Divider style={{ borderColor: '#d1d1d1', marginBottom: 15 }} />
          <Col span={24}
            style={{
              display: width > 768 && 'flex',
              alignItems: width > 768 && 'center',
              flexDirection: width > 768 && 'row',
              justifyContent: width > 768 && 'space-between',
              textAlign: 'center'
            }}
          >
            <Row
              style={{
                width: '100%'
              }}
            >
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                <div style={{ width: '100%' }}>PERIODO DA VIGÊNCIA:</div>
                <DatePicker.RangePicker format='DD/MM/yyyy' style={{ width: '100%' }} value={date} onChange={(e) => {
                  setDate(e);
                  if(e) {
                    setSegurado('');
                  }
                }} />
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                {(user && user.tipo !== 'corretor') && (
                  <div>
                    <div style={{ width: '100%' }}>PRODUTOR:</div>
                    <Select allowClear placeholder='SELECIONAR' style={{ width: '100%' }} onChange={e => {
                      setCorretor(e ? e : null);
                    }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    value={corretor}
                    >
                      <Select.Option value={'null'}>{corretora.razao_social}</Select.Option>
                      {corretores?.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((item, index) => (
                        <Select.Option key={index} value={item.uid}>
                          {item.nomeCompleto}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                <div>
                  <div style={{ width: '100%' }}>SEGURADORA:</div>
                  <Select allowClear placeholder='SELECIONAR' style={{ width: '100%' }} onChange={e => {
                    setSeguradora(e ? e : null);
                  }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  value={seguradora}
                  >
                    {seguradoras?.sort((a, b) => a.razao_social.localeCompare(b.razao_social)).map((item, index) => (
                      <Select.Option key={index} value={item.uid}>
                        {item.razao_social}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={4}>
                <div>
                  <div style={{ width: '100%' }}>ADESÃO:</div>
                  <DatePicker.YearPicker maxLength={4} style={{ width: '100%' }} allowClear type='text' value={anoAdesao} placeholder='ANO' onChange={(e) => setAnoAdesao(e)} />
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
            </Row>
          </Col>
          <Divider style={{ borderColor: '#d1d1d1', marginBottom: 15 }} />
          <Col span={24}
            style={{
              display: width > 768 && 'flex',
              alignItems: width > 768 && 'center',
              flexDirection: width > 768 && 'row',
              justifyContent: width > 768 && 'space-between',
              textAlign: 'center'
            }}
          >
            <Row style={{ width: '100%' }}>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                <div>
                  <div style={{ width: '100%' }}>SEGURADO:</div>
                  <Input style={{ width: '100%' }} allowClear type='text' value={segurado} placeholder='SEGURADO' onChange={(e) => {
                    setSegurado(maskOnlyLetters(e.target.value));

                    if(e.target.value) {
                      setPlaca('');
                      setCPF('');
                      setDate(null);
                    }
                  }} />
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                <div>
                  <div style={{ width: '100%' }}>PLACA:</div>
                  <Input maxLength={7} style={{ width: '100%' }} allowClear type='text' value={placa} placeholder='PLACA' onChange={(e) => {
                    setPlaca(String(e.target.value).toUpperCase());
                    
                    if(e.target.value) {
                      setDate(null);
                      setSegurado('');
                    }
                  }} />
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={5}>
                <div>
                  <div style={{ width: '100%' }}>CPF:</div>
                  <Input style={{ width: '100%' }} type='tel' value={cpf} allowClear placeholder='CPF' onChange={(e) => setCPF(maskCPF(e.target.value))} />
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
              <Col span={4}>
                <div>
                  <div style={{ width: '100%' }}>PLACA PREMIADA:</div>
                  <Input maxLength={3} style={{ width: '100%' }} allowClear type='text' value={placaPremiada} placeholder='PLACA PREMIADA' onChange={(e) => {
                    setPlacaPremiada(String(e.target.value).toUpperCase());
                    
                    if(e.target.value) {
                      setCorretor(null);
                      setSeguradora(null);
                      setAnoAdesao('');
                      setSegurado('');
                      setPlaca('');
                      setCPF('');
                      setDate(null);
                      setSegurado('');
                    }
                  }} />
                </div>
              </Col>
              <Col span={1}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex'
                }}
              >
                <div
                  style={{ border: '.5px solid #d1d1d1', height: '100%', width: 1 }}
                />
              </Col>
            </Row>
          </Col>
          <Divider style={{ borderColor: '#d1d1d1', marginBottom: 15 }} />
        </Row>
        <TableSeguro
          seguradora={seguradora}
          corretor={corretor}
          date={date}
          cpf={cpf}
          placa={placa}
          user={user}
          infiniteData={false}
          corretora={corretora.uid}
          setSeguros={setSeguros}
          anoAdesao={anoAdesao}
          segurado={segurado}
          seguros={seguros}
          setViewNewSeguro={setViewNewSeguro}
          businessInfo={businessInfo}
          placaPremiada={placaPremiada}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;