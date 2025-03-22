import { createGlobalStyle } from 'styled-components';

// 📌 Estilos globales para la aplicación
const GlobalStyles = createGlobalStyle`
  /* 📌 Fuente personalizada */
  @font-face {
    font-family: 'MiFuente';
    src: url('/Font/WEB/fonts/Hoover-Medium.woff2') format('woff2'),
         url('/Font/WEB/fonts/Hoover-Medium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  /* 🔧 Reseteo de márgenes y box model */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 💬 Estilos base de html y body */
  html, body {
    height: 100vh;
    overflow: hidden; /* 🔒 Evita scroll en el body */
    font-family: 'MiFuente', sans-serif;
    background-color: #fff;
  }

  /* Si usas #root u otro wrapper, puedes ajustar aquí también */
  #root {
    height: 100%;
  }
`;

export default GlobalStyles;
