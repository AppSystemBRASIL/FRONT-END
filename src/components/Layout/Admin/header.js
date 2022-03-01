import React, { Fragment, useState } from 'react';
import { Image } from 'antd';

import styled from 'styled-components';
import colors from '../../../utils/colors';

import { CSSTransition } from 'react-transition-group';

import useAuth from '../../../hooks/useAuth';

import Router from 'next/router';
import router from '../../../router';

const Header = ({ collapsed }) => {
  const { user, signOut, businessInfo, setCollapsedSideBar } = useAuth();

  const [activeMenu, setActiveMenu] = useState('main');

  return (
    <HeaderComponent bg={businessInfo.layout.theme} sidebar={true} mobile={window.screen.width < 768} className={'home-section '+ (collapsed && 'close')}>
      <div style={{ paddingTop: 6 }} className='home-content'>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {true ? (
            <Fragment>
              <i style={{cursor: 'pointer', marginRight: 10}} className={'bx '+(collapsed ? (window.screen.width < 768 ? 'bx-left-indent' : 'bx-right-indent') : 'bx-menu bx-menu-1')} onClick={() => {
                setCollapsedSideBar(collapsedSideBarData => !collapsedSideBarData)
              }} />
              <span className={'text '+(collapsed && 'show')} style={{lineHeight: .6}}>
                {businessInfo.razao_social}
                <br/>
                <span style={{fontSize: 15}}>{businessInfo.slogan || 'sistema de gestão'}</span>
              </span>
            </Fragment>
          ) : (
            <Fragment>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <i style={{fontSize: 35, color: 'white'}} className='bx bxs-car' />
                <span className={'text show'} style={{lineHeight: .6, color: 'white', fontSize: 17, marginTop: 5, marginLeft: 5}}>
                  {businessInfo.razao_social}
                  <br/>
                  <span style={{fontSize: 10}}>{businessInfo.slogan}</span>
                </span>
              </div>
              <MenuHeader theme={businessInfo.layout.theme} style={{marginLeft: 25}}>
                <ul>
                  {router.slice(0, 5).map((item, index) => {
                    if(!item.pages)
                    return (
                      <li onClick={() => Router.push(item.patchname)} key={index}>
                          <i style={{fontSize: 20}} className={item.icon}/>
                          <span>{item.title}</span>
                          <i />
                      </li>
                    )

                    return (
                      <li key={index}>
                        <i style={{fontSize: 20}} className={item.icon}/>
                        <span>{item.title}</span>
                        <i className='bx bxs-chevron-down arrow'></i>

                        <div className='sub-menu'>
                          <ul>
                            {item.pages.map((item1, index1) => (
                              <li onClick={() => Router.push(item1.patchname)} key={index1}>
                                <span>{item1.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                  <li>
                    <i className='bx bx-plus' />
                    <span>MAIS...</span>
                    <i />
                    <div className='sub-menu'>
                      <ul>
                        {router.slice(5, router.length).map((item, index) => (
                          <li
                          onClick={() => {
                            if(!item.pages) {
                              Router.push(item.patchname)
                            }
                          }}
                          key={index}>
                            <span>{item.title}</span>
                            {item.pages && <i className='bx bxs-chevron-right arrow'/>}
                            {item.pages && (
                              <div className='drop-menu'>
                                <ul>
                                  {item.pages.map((item1, index1) => (
                                    <li onClick={() => Router.push(item1.patchname)} key={index1}>{item1.title}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>
              </MenuHeader>
            </Fragment>
          )}
        </div>
        <div className='box-user' style={{display: 'flex', alignItems: 'center'}}>
          <div className='user-info' style={{ textAlign: 'right', lineHeight: 1 }}>
            <div style={{textTransform: 'uppercase', fontWeight: 700, fontSize: '1rem'}}>{user.displayName}</div>
            <div>{String(user.tipo).toUpperCase()}</div>
          </div>
          <Image style={{width: 45, height: 45, borderRadius: 8, marginLeft: 10}} preview={false} src="https://i1.wp.com/terracoeconomico.com.br/wp-content/uploads/2019/01/default-user-image.png?ssl=1" alt="profile" />
          <DropdownMenu bg={businessInfo.layout.theme} className={'dropdown-menu '}>
            <div className={'content '+(collapsed ? 'collapsed' : null)}>
              <CSSTransition
                in={activeMenu === 'main'}
                unmountOnExit
                timeout={500}
                classNames='menu-primary'
              >
                <div className='menu'>
                  <DropdownItem onClick={() => Router.push('/painel/perfil')}>
                    <div>
                      <span className='icon-button'><i className='bx bxs-user'/></span> MEU PERFIL
                    </div>
                  </DropdownItem>
                  <DropdownItem onClick={signOut}>
                    <div>
                      <span className='icon-button'><i className='bx bx-log-out'/></span> DESLOGAR
                    </div>
                  </DropdownItem>
                </div>
              </CSSTransition>
            </div>
          </DropdownMenu>
        </div>
      </div>
    </HeaderComponent>
  );
}

export default Header;

const HeaderComponent = styled.section`
  position: fixed;
  z-index: 999;
  left: ${props => props.sidebar ? '280px' : '0'};
  width: ${props => props.sidebar ? 'calc(100% - 280px)' : '100%'};
  transition: all .5s ease;
  padding-left: 20px;
  padding-right: 20px;
  height: 70px;
  align-items: center;
  background-color:  ${props => props.sidebar ? '#FFFFFF' : props.theme.colors[props.bg].primary};
  box-shadow: ${props => props.sidebar ? '1px 1px 5px #d1d1d1' : 'none'};

  @media screen and (max-width: 768px) {
    left: 0;
    width: 100%;
  }

  &.close {
    left: 78px;
    width: calc(100% - 78px);

    @media screen and (max-width: 768px) {
      .home-content {
        .text {
          opacity: 1;

          &.show {
            opacity: 0;
          }
        }
      }
    }
  }

  .home-content {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .bx-menu, .text, .bx-right-indent, .bx-left-indent {
      color: ${colors.text.secondary};
    }

    .bx-menu, .bx-right-indent, .bx-left-indent {
      font-size: 35px;
    }

    .text {
      font-size: 26px;
      font-weight: 600;
      transition: all .3s ease;
      opacity: 0;

      &.show {
        opacity: 1;
      }
    }

    .box-user {
      background-color: ${props => props.theme.colors[props.bg].primary};
      padding: 5px;
      border-radius: 5px;
      padding-left: 15px;

      .user-info {
        color: #F0F0F0;
      }

      &:hover {
        border-bottom: none;

        .dropdown-menu {
          display: block;
        }
      }
    }

    
  }
`;

const MenuHeader = styled.div`
  display: flex;
  text-align: center;
  
  ul {
    list-style: none;
    display: inline-flex;
    color: #FFFFFF;
    justify-content: space-between;

    li {
      margin-top: 15px;
      height: 55px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 150px;
      padding-left: 10px;
      padding-right: 10px;
      border-left: 1px solid #D1D1D1;

      &:last-child {
        border-right: 1px solid #D1D1D1;
      }

      &:hover {
        .sub-menu {
          display: block;
          position: absolute;
          margin-left: -10px;

          ul {
            display: block;
            
            li {
              &:hover {
                background-color: ${props => props.theme.colors[props.bg].secondary};

                .drop-menu {
                  display: block;
                }
              }
            }
          }
        }
      }

      i {
        margin-right: 6px;
      }

      &.active, &:hover {
        background-color: ${props => props.theme.colors[props.bg].secondary};
        border-radius: 3px;
      }

      span {
        text-decoration: none;
        color: #FFFFFF;
        font-size: 17px;
      }

      .sub-menu {
        display: none;
        padding-top: 10px;
        top: 60px;

        ul {
          background-color: ${props => props.theme.colors[props.bg].secondary};
          padding: 10px 0 10px 0;

          li {
            margin-top: 0;
            padding: 0 0 0 5px;
            border: none;
            border-bottom: 1px solid #D1D1D1;
            width: 170px;
            margin-left: 10px;
            margin-right: 10px;

            &:last-child {
              border-bottom: none;
            }

            .drop-menu {
              display: none;
              position: absolute;
              left: 180px;
              margin-top: 110px;
              padding-left: 10px;

              ul {
                background-color: ${props => props.theme.colors[props.bg].secondary};
                border-left: 1px solid #D1D1D1;


                li {
                  width: 120px;
                }
              }
            }
          }
        }
      }
    }
  }
`;

const DropdownMenu = styled.div`
  display: none;
  position: absolute;
  top: 50px;
  right: 0;
  width: 300px;
  transform: translateX(-6.5%);
  border-radius: 5px;
  overflow: hidden;
  transition: all 1s ease;

  .content {
    border: 1px solid ${props => props.theme.colors[props.bg].secondary};
    padding: 1rem;
    margin-top: 20px;
    background-color: ${props => props.theme.colors[props.bg].primary};

    .menu-primary {
      width: 100%;
      .menu {
        width: 100%;
      }
    }

    .menu-secondary {
      width: 100%;
      .menu {
        width: 100%;
        
      }
    }

    .menu-primary-enter {
      position: absolute;
      transform: translateX(-110%);
    }

    .menu-primary-enter-active {
      transform: translateX(0%);
      transition: all .5s ease;
    }

    .menu-primary-exit {
      position: absolute;
    }

    .menu-primary-exit-active {
      transform: translateX(-110%);
      transition: all .5s ease;
    }

    .menu-secondary-enter {
      transform: translateX(110%);
    }

    .menu-secondary-enter-active {
      transform: translateX(0%);
      transition: all .5s ease;
    }

    .menu-secondary-exit-active {
      transform: translateX(110%);
      transition: all .5s ease;
    }

    .box-content {
      margin-top: 10px;
      padding: 10px 7px 10px 7px;
      background-color: #F9F9F9;
      border-radius: 5px;
      font-weight: 500;

      span {
        font-weight: 400;
        color: ${colors.text.secondary};
      }

      .content-menu {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        margin-top: 10px;
      }
    }
  }
`;

const DropdownItem = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  padding: .5rem;
  display: flex;
  cursor: pointer;
  justify-content: space-between;

  &:hover {
    div {
      span {
        &.icon-button {
          background-color: #F0F0F0;
          color: ${colors.text.secondary};
        }
      }
    }
  }

  div {
    display: flex;
    align-items: center;

    span {
      &.icon-button {
        width: 35px;
        height: 35px;
        background-color: ${props => props.colorSecondary};
        border-radius: 100%;
        padding: 5px;
        margin: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #FFFFFF;
        margin-right: 10px;
      }
    }

    font-size: 15px;
    color: #FFFFFF;
    font-weight: 500;
    text-transform: uppercase;
  }

  span {
    color: #FFFFFF;
  }

  &:hover {
    background-color: ${props => props.colorSecondary};
  }
`;