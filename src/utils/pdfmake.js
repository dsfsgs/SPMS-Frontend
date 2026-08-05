import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'src/pdfmake/vfs_fonts'

pdfMake.vfs = pdfFonts.pdfMake.vfs

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },

  Candara: {
    normal: 'Candara.ttf',
    bold: 'Candara_Bold.ttf',
    italics: 'Candara_Italic.ttf',
    bolditalics: 'Candara_Bold_Italic.ttf',
  },

  Poppins: {
    normal: 'Poppins-Regular.ttf',
    bold: 'Poppins-Bold.ttf',
    italics: 'Poppins-Italic.ttf',
    bolditalics: 'Poppins-BoldItalic.ttf',
  },
}

export default pdfMake
