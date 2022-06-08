import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

export default async function printListSeguros(seguros, corretora, filtros) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  function getTableListHeaderWidth() {
    const array = [];
    array.push(55);
    array.push(25);
    array.push('*');
    if(!filtros.corretor) {
      array.push(100);
    }
    array.push(65);
    array.push(20);
    return array;
  }

  function getTableListHeader() {
    const array = [];
    array.push({
      text: 'VIGÊNCIA',
      fontSize: 10,
    });
    array.push({
      text: 'ANO',
      fontSize: 10,
    });
    array.push({
      text: 'SEGURADO',
      fontSize: 10,
    });
    if(!filtros.corretor) {
      array.push({
        text: 'PRODUTOR',
        fontSize: 10,
      });
    }
    array.push({
      text: 'SEGURADORA',
      fontSize: 10,
    });
    array.push({
      text: '%',
      fontSize: 10,
      alignment: 'center'
    });
    return array;
  }

  function getTableList(item) {
    const array = [];
    array.push({
      text: format(item.seguro.vigenciaFinal.toDate(), 'dd/MM/yyyy'),
      fontSize: 10
    });
    array.push({
      text: item.segurado.anoAdesao,
      fontSize: 10,
    });
    array.push({
      text: item.segurado.nome,
      fontSize: 10
    });
    if(!filtros.corretor) {
      array.push({
        text: item.corretor && item.corretor.nome.split(' ').slice(0, 2).join(' '),
        fontSize: 10
      });
    }
    array.push({
      text: item.seguradora.razao_social.split(' ')[0],
      fontSize: 10
    });
    array.push({
      text: item.valores.percentual,
      fontSize: 10
    });
    return array;
  }

  const content = [
    {
			table: {
        widths: ['*', 154.4],
				body: [
          [ 
            [
              {
                text: corretora.razao_social,
                alignment: 'left',
                bold: true,
                fontSize: 18,
                marginTop: 5
              },
              {
                text: 'RELATÓRIO DE SEGUROS',
                alignment: 'left',
                bold: true,
                fontSize: 10,
                marginBottom: 10
              }
            ],
            [
              {
                text: filtros.date && `PERÍODO:\n${format(filtros.date[0].toDate(), 'dd/MM/yyyy')} - ${format(filtros.date[1].toDate(), 'dd/MM/yyyy')}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.corretor && `PRODUTOR:\n${filtros.corretor}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.seguradora && `SEGURADORA:\n${filtros.seguradora}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.placa && `PLACA: ${filtros.placa}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: filtros.cpf && `CPF: ${filtros.cpf}`,
                bold: true,
                fontSize: 10,
              }
            ]
          ],
				]
			}
		},
    {
			table: {
        widths: getTableListHeaderWidth(),
				body: [
					getTableListHeader(),
				]
			}
		},
    {
			table: {
        widths: getTableListHeaderWidth(),
				body: [...seguros].map((item) => getTableList(item))
			}
		},
    {
			table: {
        widths: '*',
        border: null,
				body: [
          [ 
            {
              text: '',
              alignment: 'left',
              bold: true,
            }
          ],
				]
			}
		},
    {
			table: {
        widths: '*',
				body: [
          [ 
            {
              text: `QUANTIDADE DE SEGUROS: ${[...seguros].length.toString().padStart(2, '0')}`,
              alignment: 'left',
            }
          ],
				]
			}
		}
  ];

  const docDefinitions = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content
  }

  pdfMake.createPdf(docDefinitions).print();
}