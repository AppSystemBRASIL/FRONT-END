import React, { useEffect, useState } from 'react';

export default function  App() {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      window.location.href = 'https://www.apple.com/br/app-store/';
    }else if(userAgent.match(/Android/i)) {
      window.location.href = 'https://play.google.com/store/apps';
    }else {
      alert('Acesse com seu celular!');
    }
  }, []);

  return null;
}