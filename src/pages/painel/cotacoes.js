import { Col, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';

import TableCotacao from '../../components/Table/Cotacao';

import { maskCPF } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';

const Cotacao = () => {
  const { setCollapsedSideBar, businessInfo } = useAuth();

  const [cpf, setCPF] = useState('');
  const [status, setStatus] = useState(null);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setWidth(window.screen.width);
  }, []);

  useEffect(() => {
    if(cpf.length === 14) {
      setStatus(null);
    }
  }, [cpf]);

  useEffect(() => {
    if(status !== null) {
      setCPF('');
    }
  }, [status]);

  if(!businessInfo) {
    return null;
  }

  return (
    <LayoutAdmin title='COTAÇÕES'>
      <CardComponent>
        <Row
          style={{
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            marginBottom: 10
          }}
        >
          <Col sm={24} md={12}
            style={{
              display: 'flex', 
              alignItems: 'center',
            }}
          >
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>COTAÇÕES DE SEGUROS</h1>
          </Col>
          <Col xs={24} md={12}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: width <= 768 ? 'space-between' : 'end'
            }}
          >
            <div style={{ marginRight: 10 }}>
              <div style={{ width: '100%' }}>FILTRO POR CPF:</div>
              <Input style={{ width: width <= 768 && 200 }} type='tel' value={cpf} placeholder='000.000.000-00' onKeyDown={(e) => {
                if(cpf.length === 14 && e.code === 'Backspace') {
                  setCPF('');
                }
              }} onChange={(e) => setCPF(maskCPF(e.target.value))} />
            </div>
            {cpf.length < 14 && (
              <div>
                <div style={{ width: '100%' }}>FILTRO POR STATUS:</div>
                <Select style={{
                  width: width <= 768 ? 150 : '100%'
                }}
                  onChange={(e) => setStatus(e)}
                  value={status}
                >
                  <Select.Option value={null}>TODAS</Select.Option>
                  <Select.Option value={0}>AGUARDANDO COTAÇÃO</Select.Option>
                  <Select.Option value={1}>COTANDO SEGURO</Select.Option>
                  <Select.Option value={2}>SEGURO GERADO</Select.Option>
                </Select>
              </div>
            )}
          </Col>
        </Row>
        <TableCotacao status={status} infiniteData={true} cpf={cpf} corretora={businessInfo.uid} />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Cotacao;