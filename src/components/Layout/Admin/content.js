import React from 'react';
import styled from "styled-components";

const Content = ({ collapsed, children }) => {
  return (
    <ContentPage width={window.screen.width} className={'sidebar ' + (collapsed ? ' close ' : '')}>
      {children}
    </ContentPage>
  );
}

export default Content;

const ContentPage = styled.div`
  position: relative;
  left: 260px;
  width: calc(100% - 260px);
  transition: all .5s ease;
  padding: 100px 25px 0 100px;

  @media screen and (max-width: 768px) {
    left: 0;
    width: 100%;
    padding: 100px 10px 0 10px;
  }


  &.close {
    left: 78px;
    width: calc(100% - 78px);

    @media screen and (max-width: 768px) {
      left: 78px;
      width: calc(100% - 78px);
    }
  }

  &.sidebar {
    left: 0;
    width: 100%;
  }
`;