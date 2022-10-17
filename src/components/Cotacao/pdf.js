import pdfMake from 'pdfmake/build/pdfmake';
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
                text: dados.corretora.razao_social,
                alignment: 'left',
                bold: true,
                fontSize: 18,
                marginTop: 5
              },
              {
                text: `FOMULÁRIO PARA CÁLCULO DE ${String(dados.tipo).split('-').join(' ').toUpperCase()}`,
                alignment: 'left',
                bold: true,
                fontSize: 10,
              }
            ],
            [
              {
                text: `DATA: ${format(dados.created.toDate(), 'dd/MM/yyyy')}`,
                alignment: !dados.corretor ? 'center' : 'left',
                bold: true,
                fontSize: 10,
                marginTop: !dados.corretor ? 15 : 0
              },
              {
                text: !dados.corretor ? '' : 'PRODUTOR:',
                alignment: 'left',
                bold: true,
                fontSize: 10,
              },
              {
                text: !dados.corretor ? '' : String(dados.corretor.nome).toUpperCase(),
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
		}
  ];

  const bodySegurado = [];

  bodySegurado.push([{
    text: 'NOME',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.segurado.nome).toUpperCase(),
    fontSize: 10,
  }])

  bodySegurado.push([{
    text: 'CPF / CNPJ',
    bold: true,
    fontSize: 10,
  }, {
    text: dados.segurado.cpf,
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'TELEFONE',
    bold: true,
    fontSize: 10,
  }, {
    text: dados.segurado.celular || dados.segurado.telefone || dados.celular,
    fontSize: 10
  }]);

  bodySegurado.push([{
    text: 'EMAIL',
    bold: true,
    fontSize: 10,
  }, {
    text: dados.segurado.email,
    fontSize: 10
  }]);

  bodySegurado.push([{
    text: 'ESTADO CIVIL',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.segurado.estadoCivil || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'CEP',
    bold: true,
    fontSize: 10,
  }, {
    text: dados.segurado.cep || dados.endereco.cep || '',
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'ESTADO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.endereco.estado || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'CIDADE',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.endereco.cidade || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'DATA 1° CNH',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.segurado.cnh || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'PROPRIETÁRIO',
    bold: true,
    fontSize: 10,
  }, {
    text: `${[undefined, null].includes(dados.segurado.proprietario) ? '' : dados.segurado.proprietario.toUpperCase()}`,
    fontSize: 10,
  }]);

  bodySegurado.push([{
    text: 'PROFISSÃO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.segurado.profissao || '').toUpperCase(),
    fontSize: 10,
  }]);

  details.push({
    table: {
      widths: ['30%', '70%'],
      body: [
        [
          {
            text: 'DADOS DO SEGURADO',
            fontSize: 10,
            bold: true,
          },
          {
            text: null,
            fontSize: 10,
            bold: true
          }
        ]
      ]
    }
  })

  details.push({
    table: {
      widths: ['30%', '70%'],
      body: bodySegurado
    }
  })

  const bodySeguro = [];

  bodySeguro.push([{
    text: 'SEGURADORA',
    bold: true,
    fontSize: 10,
  }, {
    text: dados?.seguro?.seguradora || dados?.seguradora?.razao_social,
    fontSize: 10,
  }])

  bodySeguro.push([{
    text: 'FIM DA VIGÊNCIA',
    bold: true,
    fontSize: 10,
  }, {
    text: !dados.seguro.vigencia ? '' : typeof dados.seguro.vigencia === 'object' ? format(new Date(dados.seguro.vigenciaFinal.seconds * 1000), 'dd/MM/yyyy') : dados.seguro.vigencia,
    fontSize: 10,
  }])

  bodySeguro.push([{
    text: 'HOUVE SINISTRO',
    bold: true,
    fontSize: 10,
  }, {
    text: [undefined, null].includes(dados.segurado.proprietario) ? '' : dados.seguro.tipo === 'NOVO' ? null : `${dados.seguro.sinistro?.toUpperCase() || ''}`,
    fontSize: 10,
  }])

  if(bodySeguro.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DO SEGURO',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    })

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodySeguro
      }
    })
  }

  const bodyVeiculo = [];

  bodyVeiculo.push([{
    text: 'VEÍCULO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados?.veiculo?.veiculo || '').toUpperCase(),
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'PLACA DO VEÍCULO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.veiculo.placa).toUpperCase(),
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'ANO/MODELO',
    bold: true,
    fontSize: 10,
  }, {
    text: `${dados?.veiculo?.modelo || ''}`,
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'CEP',
    bold: true,
    fontSize: 10,
  }, {
    text: dados.veiculo.cepPernoite || dados.veiculo.cep || dados.segurado.cep || dados.endereco.cep || '',
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'FINANCIADO',
    bold: true,
    fontSize: 10,
  }, {
    text: `${[undefined, null].includes(dados.veiculo.financiado) ? '' : dados?.veiculo?.financiado?.toUpperCase() || ''}`,
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'BLINDADO',
    bold: true,
    fontSize: 10,
  }, {
    text: `${[undefined, null].includes(dados.veiculo.blindado) ? '' : dados?.veiculo?.blindado?.toUpperCase() || ''}`,
    fontSize: 10,
  }])

  bodyVeiculo.push([{
    text: 'TEM KIT GÁS',
    bold: true,
    fontSize: 10,
  }, {
    text: `${[undefined, null].includes(dados.veiculo.kitGas) ? '' : dados?.veiculo?.kitGas?.toUpperCase() || ''}`,
    fontSize: 10,
  }])
  
  if(bodyVeiculo.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'DADOS DO VEÍCULO',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyVeiculo
      }
    });
  }

  const bodyCondutor = [];

  bodyCondutor.push([{
    text: 'NOME',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados?.condutor?.nome || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodyCondutor.push([{
    text: 'RELAÇÃO COM O SEGURADO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados?.condutor?.relacao || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodyCondutor.push([{
    text: 'CPF',
    bold: true,
    fontSize: 10,
  }, {
    text: dados?.condutor?.cpf,
    fontSize: 10,
  }]);

  bodyCondutor.push([{
    text: 'ESTADO CIVIL',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados?.condutor?.estadoCivil || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodyCondutor.push([{
    text: 'PROFISSAO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados?.condutor?.profissao || '').toUpperCase(),
    fontSize: 10
  }]);

  if(bodyCondutor.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'PRINCIPAL CONDUTOR',
              alignment: 'center',
              fontSize: 10,
              bold: true,
            },
            {
              text: '(A PESSOA QUE UTILIZA O VEÍCULO DO SEGURADO 2 OU MAIS DIAS POR SEMANA, CASO EXISTAM MAIS DE UM CONDUTOR NESTA CONDIÇÃO, SERÁ DEFINIDO SEMPRE O DE MENOR IDADE)',
              fontSize: 8,
            }
          ]
        ]
      }
    });

    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyCondutor
      }
    })
  }

  const bodyRisco = [];

  bodyRisco.push([{
    text: 'COBERTURA 18/26 ANOS',
    bold: true,
    fontSize: 10,
  },
  {
    text: String(dados.riscos.condutorResideMenor || '').toUpperCase(),
    fontSize: 10,
  }]);

  bodyRisco.push([{
    text: 'USO DO VEÍCULO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.riscos.usoVeiculo || '').toUpperCase(),
    fontSize: 10,
  }])

  bodyRisco.push([{
    text: 'RESIDE EM',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.riscos.residenciaVeiculo || '').toUpperCase(),
    fontSize: 10,
  }])

  bodyRisco.push([{
    text: 'GARAGEM NA RESIDÊNCIA',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.riscos.garagemResidencia || '').toUpperCase(),
    fontSize: 10,
  }])

  bodyRisco.push([{
    text: 'GARAGEM NO TRABALHO',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.riscos.garagemTrabalho || '').toUpperCase(),
    fontSize: 10,
  }])

  bodyRisco.push([{
    text: 'GARAGEM NA ESCOLA',
    bold: true,
    fontSize: 10,
  }, {
    text: String(dados.riscos.garagemEscola || '').toUpperCase(),
    fontSize: 10,
  }])

  if(bodyRisco.length > 0) {
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            {
              text: 'AVALIAÇÃO DE RISCO',
              fontSize: 10,
              bold: true,
            },
            {
              text: null,
              fontSize: 10,
            }
          ]
        ]
      }
    });
    details.push({
      table: {
        widths: ['30%', '70%'],
        body: bodyRisco
      }
    })
  }

  details.push({
    table: {
      widths: ['100%'],
      body: [
        [
          {
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
            text: `APÓLICE: ${dados?.seguro?.apolice || ''}`,
            bold: true,
            fontSize: 10,
            border: [true, false, false, true],
          },
          {
            text: `C.I: ${dados?.seguro?.ci || ''}`,
            bold: true,
            fontSize: 10,
            border: [false, false, true, true],
          }
        ]
      ]
    }
  })

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