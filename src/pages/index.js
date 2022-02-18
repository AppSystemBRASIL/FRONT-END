import React from 'react';
import Router from 'next/router';

const Index = () => {
  return (
    <div style={{
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      display: 'flex',
    }}>
      <button onClick={() => Router.push('/painel')}>PAINEL</button>
    </div>
  )
}

export default Index;