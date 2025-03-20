import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'MiFuente';
    src: url('/Font/WEB/fonts/Hoover-Medium.woff2') format('woff2'),
         url('/Font/WEB/fonts/Hoover-Medium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

   body {
    font-family: 'MiFuente', sans-serif;
  }
`;

export default GlobalStyles;
