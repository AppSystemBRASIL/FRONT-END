import React from 'react';

import {
  Spin
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import colors from '../../utils/colors';
import useAuth from 'hooks/useAuth';
import { useTheme } from 'styled-components';

const LoadingPage = () => {
  const { businessInfo } = useAuth();
  
  const theme = useTheme();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: businessInfo ? theme.colors[businessInfo.layout.theme].primary : colors.primary,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <center>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: 'white' }} spin />} />
        </center>
        <br/>
        <h1 style={{
          color: 'white'
        }}>CARREGANDO</h1>
      </div>
    </div>
  );
}

export default LoadingPage;