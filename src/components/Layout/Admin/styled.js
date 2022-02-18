import styled from 'styled-components';
import colors from '../../../utils/colors';


export const DivBoxPayment = styled.div`
  background-color: ${colors.primary.default};
  width: 100vw;
  height: 100vh;

  .logout {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 20px;

    svg {
      color: #FFFFFF;
      font-size: 1.4rem;
      margin-right: 5px;
      transform: rotate(180deg);
    }

    h3 {
      margin-left: 5px;
      color: #FFFFFF;
      font-size: 1.4rem;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    line-height: 1.4;
  }

  h1 {
    font-size: 42px;
    color: #6d819c;
    text-align: left;
  }

  h2 {
    font-size: 28px;
    letter-spacing: -2px;
    color: #6d819c;
    text-align: center;
    line-height: 2.8;
  }

  h3 {
    font-size: 16px;
    color: #dddfe6;
    letter-spacing: 1px;
    text-align: left;
  }

  h4 {
    font-size: 16px;
    color: #7495aa;
    letter-spacing: 1px;
    text-align: left;
    line-height: 2;
  }

  h5 {
    font-size: 11px;
    font-weight: 700;
    color: #c9d6de;
    letter-spacing: 1px;
    text-align: left;
    text-transform: uppercase;
  }

  h5 > span {
    margin-left: 87px;
  }

  h5.total {
    margin-top: 20px;
    color: #6d819c;
  }

  h6 {
    font-family: 'Poppins';
    font-size: 18px;
    font-weight: 400;
    color: #f4f5f9;
    letter-spacing: 0px;
    text-align: left;
    text-transform: uppercase;
    line-height: 1.8;
  }

  h6 > span {
    margin-left: 64px;
  }

  .checkout {
    width: 670px;
    height: 555px;
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: #dddfe6;
    overflow: hidden;
    
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    border-radius: 12px;
    
    -webkit-box-shadow: 0 30px 48px rgba(0, 0, 0, .5);
    -moz-box-shadow: 0 30px 48px rgba(0, 0, 0, .5);
    box-shadow: 0 30px 48px rgba(0, 0, 0, .5);
  }

  .order {
    width: 300px;
    height: 100%;
    padding: 0 30px;
    float: left;
    background-color: #FFFFFF;
    z-index: 1;
    
    -webkit-box-shadow: 0 15px 24px rgba(37,44,65,0.16);
    -moz-box-shadow: 0 15px 24px rgba(37,44,65,0.16);
    box-shadow: 0 15px 24px rgba(37,44,65,0.16);

    .info {
      h3 {
        color: #6d819c;
      }
    }

    p {
      color: #555;
    }
  }

  .payment {
    z-index: 0;
    width: 370px;
    position: relative;
    float: right;
  }

  .card {
    position: relative;
    margin: 0 auto;
    overflow: hidden;
    z-index: 1;
    
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    border-radius: 6px;
  }

  .card-content {
    width: 100%;
    padding: 20px;
    position: relative;
    float: left;
    z-index: 1;
  }

  #logo-visa {
    position: relative;
    margin-top: -20px;
    left: 190px;
  }

  .card-form {
    width: 100%;
    position: relative;
    float: right;
    padding: 15px 35px;
  }

  .card-form > p.field {
    width: 100%;
    height: 48px;
    padding: 2px 10px;
    margin-bottom: 2px;
    background-color: #f4f5f9;
    border: 1px solid #d2d4de;
    display: inline-flex;
    align-items: center;
    align-self: center;
    align-content: center;
    
    -webkit-border-radius: 6px;
    -moz-border-radius: 6px;
    border-radius: 6px;

    &.error {
      border: 1px solid red !important;
    }
  }

  input[type=text],  input[type=tel]{
    width: 100%;
    height: 40px;
    position: relative;
    padding: 0px 0px 0px 10px;
    background-color: transparent;
    border: none;
    color: #000;
    font-family: 'Poppins';
    font-size: 20px;
    font-weight: 400;
    z-index: 0;
  }

  input[type=text]:focus, input[type=tel]:focus {
    outline: none;
  }

  ::-webkit-input-placeholder { color: #dddfe6; }
  :-moz-placeholder { color: #dddfe6; }
  ::-moz-placeholder {  color: #dddfe6; }
  :-ms-input-placeholder {  color: #dddfe6; }

  #i-cardfront, #i-cardback, #i-calendar {
    position: relative;
    top: 8px;
    z-index: 1;
  }

  #cardnumber::placeholder {
    font-size: 30px;
  }

  .space {
    margin-right: 10px;  
  }

  button:focus { outline:0; }

  .button-cta {
    width: 100%;
    height: 65px;
    position: absolute;
    float: right;
    right: 0px;
    bottom: -68px;
    padding: 10px 20px;
    background-color: #f1404b;
    border: 1px solid #f1404b;
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 24px;
    color: #f4f5f9;
    z-index: -1;
    
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;

    &.disabled {
      border: 1px solid #f1404999;
      background: #f1404999;

      &:hover {
        background: #f1404999 !important;
        border: 1px solid #f1404999 !important;
        color: white;

        span {
          padding-right: 0;

          &:after {
            opacity: 0 !important;
            right: -40px;
          }
        }
      }
    }
  }

  .button-cta:hover {
    background: rgba(193,14,26,1);
    border: 1px solid rgba(193,14,26,1);
    color: white;

    span {
      padding-right: 45px;

      &:after {
        opacity: 1;
        right: 0;
      }
    }
  }

  .button-cta span {
    display: inline-block;
    position: relative;
    
    -webkit-transition: all 0.3s;
      -moz-transition: all 0.3s;
        -ms-transition: all 0.3s;
        -o-transition: all 0.3s;
            transition: all 0.3s;
  }

  .button-cta span:after {
    content: '→';
    color: #f4f5f9;
    position: absolute;
    opacity: 0;
    top: 0;
    right: -40px;
  }

  /*--------------------
  Credit Card Background
  ---------------------*/

  .wave {
    height: 300px;
    width: 300px;
    position: relative;
    background: #780910;
    z-index: -1;
  }

  .wave:before, .wave:after {
    content: "";
    display: block;
    position: absolute;
    background: rgba(193,14,26,1);
    background: -moz-linear-gradient(top, rgba(193,14,26,1) 0%, rgba(241,64,76,0.3) 100%);
    background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(193,14,26,1)), color-stop(100%, rgba(241,64,76,0.3)));
    background: -webkit-linear-gradient(top, rgba(193,14,26,1) 0%, rgba(241,64,76,0.3) 100%);
    background: -o-linear-gradient(top, rgba(193,14,26,1) 0%, rgba(241,64,76,0.3) 100%);
    background: -ms-linear-gradient(top, rgba(193,14,26,1) 0%, rgba(241,64,76,0.3) 100%);
    background: linear-gradient(to bottom, rgba(193,14,26,1) 0%, rgba(241,64,76,0.3) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#c10e1a', endColorstr='#f1404c', GradientType=0 );
    
    -webkit-border-radius: 50% 50%;
      -moz-border-radius: 50% 50%;
            border-radius: 50% 50%;
  }

  .wave:after {
    height: 300px;
    width: 300px;
    left: 30%;
    top: 20%;
    opacity: 0.8;
  }

  .wave:before {
    height: 360px;
    width: 360px;
    left: -5%;
    top: -70%;
  }

  /*--------------------
  Payment Notification
  ---------------------*/

  .paid {
    z-index: 0;
    width: 370px;
    position: relative;
    float: right;
    padding: 30px;
    text-align: center;
    display: none;
  }

  .paid > h2 {
    line-height: 1;
    margin-top: 10px;
    color: #3ac569;
  }

  /*--------------------
  Credits
  ---------------------*/

  .icon-credits {
    width: 100%;
    position: absolute;
    bottom: 4px;
    font-family:'Open Sans', 'Helvetica Neue', Helvetica, sans-serif;
    font-size: 12px;
    color: rgba(0,0,0,0.08);
    text-align: center;
    z-index: -1;
  }

  .icon-credits a {
    text-decoration: none;
    color: rgba(0,0,0,0.12);
  }
`;