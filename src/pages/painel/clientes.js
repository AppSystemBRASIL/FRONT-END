import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col } from 'antd';

import TableClientes from '../../components/Table/Clientes';

import { maskCPF } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  if(!businessInfo) {
    return <></>;
  }

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
  }, []);

  const [seguros, setSeguros] = useState([]);

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='CLIENTES'>
      <CardComponent>
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>CLIENTES</h1>
          </Col>
        </Row>
        <TableClientes
          user={user}
          infiniteData={true}
          corretora={corretora.uid}
          setSeguros={setSeguros}
          seguros={seguros}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;