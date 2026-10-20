import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default [{
  files:['web/**/*.{js,jsx}'],
  languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:{...globals.browser,...globals.node},
    parserOptions:{ecmaFeatures:{jsx:true}}},
  plugins:{react,'react-hooks':hooks},settings:{react:{version:'detect'}},
  rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^React$'}],
    'no-undef':'error','react/jsx-uses-react':'error','react/jsx-uses-vars':'error',
    'react/jsx-key':'error','react/no-unknown-property':'error',
    'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'error',
    'max-len':['error',{code:120,ignoreUrls:true,ignoreRegExpLiterals:true}]}
}];
