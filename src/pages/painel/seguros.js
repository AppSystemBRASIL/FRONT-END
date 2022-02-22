import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input } from 'antd';

import TableSeguro from '../../components/Table/Seguro';

import { maskCPF } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus } from 'react-icons/fa';
import { vincularSeguro } from 'functions';

const Seguro = () => {
  const { setCollapsedSideBar } = useAuth();

  const [width, setwidth] = useState(0);

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
    setwidth(window.screen.width);
  }, []);

  const [cpf, setCPF] = useState('');

  return (
    <LayoutAdmin title='SEGUROS'>
      <CardComponent>
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444'}}>SEGUROS <sup><FaPlus onClick={() => {
              vincularSeguro()
            }} /></sup></h1>
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