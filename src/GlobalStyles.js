import { createGlobalStyle } from 'styled-components';

// 📌 Estilos globales para la aplicación, incluyendo la fuente personalizada
const GlobalStyles = createGlobalStyle`
  /* 📌 Definición de la fuente personalizada */
  @font-face {
    font-family: 'MiFuente';
    src: url('/Font/WEB/fonts/Hoover-Medium.woff2') format('woff2'),
         url('/Font/WEB/fonts/Hoover-Medium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  /* 📌 Aplicación de la fuente personalizada a todo el cuerpo del documento */
  body {
    font-family: 'MiFuente', sans-serif;
  }
`;

export default GlobalStyles;
