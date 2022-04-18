import React, { useEffect, useState } from 'react';

export default function  App() {
  const [device, setDevice] = useState(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if(userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i )) {
      setDevice('IOS');
    }else if(userAgent.match( /Android/i )) {
      setDevice('ANDROID');
    }else {
      setDevice('DESKTOP')
    }
  }, []);

  return (
    <>
      {device}
    </>
  )
}