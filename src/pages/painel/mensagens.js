import React, { useState, useEffect } from 'react';
import LayoutAdmin, { CardComponent } from '../../components/Layout/Admin';
import { Row, Col, Input, Modal, DatePicker, Select, notification, Divider, InputNumber } from 'antd';

import TableMensagem from '../../components/Table/Mensagem';

import { maskCEP, maskCPF, maskDate, maskMoney, maskOnlyLetters, maskOnlyNumbers, maskPhone, maskPlaca, maskYear } from '../../hooks/mask';

import useAuth from '../../hooks/useAuth';
import { FaPlus, FaTimes } from 'react-icons/fa';

import firebase from '../../auth/AuthConfig';

import axios from 'axios';

import { useTheme } from 'styled-components';

const Seguro = () => {
  const { user, corretora, setCollapsedSideBar, businessInfo } = useAuth();

  const theme = useTheme();

  useEffect(() => {
    setCollapsedSideBar(window.screen.width <= 768 ? false : true);
  }, []);

  const [mensagens, setMensagens] = useState([]);

  if(!user && !corretora) {
    return <></>;
  }

  if(!user) {
    return <></>;
  }

  return (
    <LayoutAdmin title='MENSAGENS'>
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
            <h1 style={{margin: 0, padding: 0, fontWeight: '700', color: '#444', textAlign: 'center'}}>MENSAGENS</h1>
          </Col>
        </Row>
        <TableMensagem
          user={user}
          infiniteData={true}
          corretora={corretora.uid}
          businessInfo={businessInfo}
        />
      </CardComponent>
    </LayoutAdmin>
  );
}

export default Seguro;