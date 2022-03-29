import pdfMake, { fonts } from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { format } from 'date-fns';

export default async function cotacaoPDF(dados, type) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const details = [
    {
			table: {
        widths: ['55%', '25%', '20%'],
				body: [
          [ 
            [
              {
                image: 'https://firebasestorage.googleapis.com/v0/b/appsystembrasil-seguro.appspot.com/o/corretora%2FX0hXIOdA5pOkyLquPIxj%2Ficon%2F1044284.jpeg?alt=media&token=4ac382b8-ed44-425b-8132-b1b2555b1a47',
                text: dados.corretora.razao_social,
                alignment: 'left',
                bold: true,
                fontSize: 18,
                marginTop: 5
              },
              {
                fillColor: '#CCCCCC',
                text: 'FOMULÁRIO PARA CÁLCULO DE SEGURO AUTOMÓVEL',
                alignment: 'left',
                bold: true,
                fontSize: 10,
              }
            ],
            [
              {
                fillColor: '#CCCCCC',
                text: `DATA: ${format(dados.created.toDate(), 'dd/MM/yyyy')}`,
                alignment: !dados.corretor ? 'center' : 'left',
                bold: true,
                fontSize: 10,
                marginTop: !dados.corretor ? 15 : 0
              },
              {
                fillColor: '#CCCCCC',
                text: !dados.corretor ? '' : 'PRODUTOR:',
                alignment: 'left',
                bold: true,
                fontSize: 10,
              },
              {
                fillColor: '#CCCCCC',
                text: !dados.corretor ? '' : dados.corretor.nome,
                alignment: 'left',
                bold: true,
                fontSize: 10,
              }
            ],
            [
              {
                qr: `https://seguro.appsystembrasil.com.br/cotacao/${dados.uid}`,
                fit: 65,
                alignment: 'center',
              },
              {
                text: 'DOCUMENTO DIGITAL',
                alignment: 'center',
                fontSize: 8,
                border: [false, true, true, true],
              }
            ]
          ],
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'DADOS DO SEGURADO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              fillColor: '#CCCCCC',
              text: 'RESPOSTAS',
              alignment: 'center',
              fontSize: 10,
              bold: true
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
					[{
            text: 'NOME',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.nome,
            fontSize: 10,
          }],
					[{
            text: 'CPF / CNPJ',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.cpf,
            fontSize: 10,
          }],
          [{
            text: 'TELEFONE',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.celular,
            fontSize: 10
          }],
          [{
            text: 'ESTADO CIVIL',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.estadoCivil,
            fontSize: 10,
          }],
          [{
            text: 'CEP',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.cep,
            fontSize: 10,
          }],
          [{
            text: 'DATA 1° CNH',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.cnh,
            fontSize: 10,
          }],
          [{
            text: 'PROPRIETÁRIO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: `${dados.segurado.proprietario ? 'SIM' : 'NÃO'}`,
            fontSize: 10,
          }],
          [{
            text: 'PROFISSÃO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.segurado.profissao,
            fontSize: 10,
          }],
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'DADOS DO SEGURO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              fillColor: '#CCCCCC',
              text: null,
              fontSize: 10,
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
					[{
            text: 'TIPO DO SEGURO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.seguro.tipo,
            fontSize: 10,
          }],
					[{
            text: 'SEGURADORA',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.seguro.seguradora,
            fontSize: 10,
          }],
          [{
            text: 'FIM DA VIGÊNCIA',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.seguro.vigencia,
            fontSize: 10,
          }],
          [{
            text: 'HOUVE SINISTRO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.seguro.tipo === 'NOVO' ? null : `${dados.seguro.sinistro ? 'SIM' : 'NÃO'}`,
            fontSize: 10,
          }],
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'DADOS DO VEÍCULO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              fillColor: '#CCCCCC',
              text: null,
              fontSize: 10,
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [{
            text: 'VEÍCULO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.veiculo.veiculo,
            fontSize: 10,
          }],
					[{
            text: 'PLACA DO VEÍCULO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.veiculo.placa,
            fontSize: 10,
          }],
					[{
            text: 'ANO/MODELO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: `${(dados.veiculo.ano && dados.veiculo.modelo) ? `${dados.veiculo.ano} - ${dados.veiculo.modelo}` : ''}`,
            fontSize: 10,
          }],
          [{
            text: 'CEP',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.veiculo.cep,
            fontSize: 10,
          }],
          [{
            text: 'FINANCIADO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: `${dados.veiculo.financiado ? 'SIM' : 'NÃO'}`,
            fontSize: 10,
          }],
          [{
            text: 'BLINDADO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: `${dados.veiculo.blindado ? 'SIM' : 'NÃO'}`,
            fontSize: 10,
          }],
          [{
            text: 'TEM KIT GÁS',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: `${dados.veiculo.kitGas ? 'SIM' : 'NÃO'}`,
            fontSize: 10,
          }],
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'PRINCIPAL CONDUTOR',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              fillColor: '#CCCCCC',
              text: '(A PESSOA QUE UTILIZA O VEÍCULO DO SEGURADO 2 OU MAIS DIAS POR SEMANA, CASO EXISTAM MAIS DE UM CONDUTOR NESTA CONDIÇÃO, SERÁ DEFINIDO SEMPRE O DE MENOR IDADE)',
              fontSize: 8,
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [{
            text: 'NOME',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.condutor.nome,
            fontSize: 10,
          }],
          [{
            text: 'RELAÇÃO COM O SEGURADO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.condutor.relacao,
            fontSize: 10,
          }],
          [{
            text: 'CPF',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.condutor.cpf,
            fontSize: 10,
          }],
          
          [{
            text: 'ESTADO CIVIL',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.condutor.estadoCivil,
            fontSize: 10,
          }],
          [{
            text: 'PROFISSAO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.condutor.profissao,
            fontSize: 10
          }],
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'AVALIAÇÃO DE RISCO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              fillColor: '#CCCCCC',
              text: null,
              fontSize: 10,
            }
          ]
				]
			}
		},
    {
			table: {
        widths: ['30%', '70%'],
				body: [
          [{
            text: 'DEPENDENTES MENORES',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.dependenteMenor,
            fontSize: 10,
          }],
          [{
            text: 'USO DO VEÍCULO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.usoVeiculo,
            fontSize: 10,
          }],
          [{
            text: 'RESIDE EM',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.residencia,
            fontSize: 10,
          }],
          [{
            text: 'GARAGEM NA RESIDÊNCIA',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.garagemResidencia,
            fontSize: 10,
          }],
          [{
            text: 'GARAGEM NO TRABALHO',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.garagemTrabalho,
            fontSize: 10,
          }],
          [{
            text: 'GARAGEM NA ESCOLA',
            fillColor: '#F1F1F1',
            bold: true,
            fontSize: 10,
          }, {
            text: dados.riscos.garagemEscola,
            fontSize: 10,
          }],
				]
			}
		},
    {
			table: {
        widths: ['100%'],
				body: [
          [
            {
              fillColor: '#CCCCCC',
              text: 'DADOS PARA FECHAMENTO',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            }
          ]
				]
			}
		},
    {
      table: {
        widths: ['100%'],
        body: [
          [{
            text: 'EMAIL:',
            bold: true,
            fontSize: 10,
            border: [true, false, true, false],
          }]
        ]
      }
    },
    {
      table: {
        widths: ['100%'],
        body: [
          [{
            text: 'ENDEREÇO:',
            bold: true,
            fontSize: 10,
            border: [true, true, true, true],
          }]
        ]
      }
    },
    {
      table: {
        widths: ['33.33%', '33.33%', '33.33%'],
        body: [
          [
            {
              text: 'RG:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'EMISSOR:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'DATA DE EMISSÃO:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['34%', '16%', '16%', '34%'],
        body: [
          [
            {
              text: 'CPF:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'BANCO:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'AGÊNCIA:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'DIA DA PARCELA:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['33.33%', '33.33%', '33.33%'],
        body: [
          [
            {
              text: 'N CARTÃO:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'BANDEIRA:',
              bold: true,
              fontSize: 10,
              border: [false, false, false, true],
            },
            {
              text: 'VALIDADE:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
    {
      table: {
        widths: ['100%'],
        body: [
          [{
            text: 'NOME NO CARTÃO:',
            bold: true,
            fontSize: 10,
            border: [true, false, true, true],
          }]
        ]
      }
    },
    {
      table: {
        widths: ['33%', '67%'],
        body: [
          [
            {
              text: 'APÓLICE:',
              bold: true,
              fontSize: 10,
              border: [true, false, false, true],
            },
            {
              text: 'C.I:',
              bold: true,
              fontSize: 10,
              border: [false, false, true, true],
            }
          ]
        ]
      }
    },
  ];

  const docDefinitions = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [details],
  };

  if(type === undefined || !type) {
    pdfMake.createPdf(docDefinitions).open();
  }else if(type === 'href') {
    pdfMake.createPdf(docDefinitions).getBlob(blob => {
      window.location.href = window.URL.createObjectURL(blob);;
    });
  }
}