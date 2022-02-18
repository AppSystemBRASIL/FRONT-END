import React from 'react';

import {
  Spin
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import colors from '../../utils/colors';

const LoadingPage = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: colors.primary.default,
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