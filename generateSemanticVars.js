// generateSemanticVars.js
import fs from 'fs';
import themes from './theme.js';

let css = '/* 生成的语义化变量 */\n\n';

const semanticMapping = {
  'bg-main': '--bg-100',
  'bg-common': '--bg-200',
  'bg-accent': '--bg-300',
  
  'text-primary': '--text-100',
  'text-secondary': '--text-200',
  
  'showcase-bg': '--primary-100',
  'showcase-separator': '--primary-200',
  'showcase-text': '--primary-300',
  
  'notification-text': '--accent-100',
  'notification-bg': '--accent-200',
};

for (const [themeName, variables] of Object.entries(themes)) {
  css += `.${themeName} {\n`;
  for (const [semanticName, numericalVar] of Object.entries(semanticMapping)) {
    if (variables[numericalVar]) {
      css += `  --${semanticName}: ${variables[numericalVar]};\n`;
    } else {
      console.warn(`警告: 在 ${themeName} 中找不到变量 ${numericalVar}`);
    }
  }
  css += `}\n\n`;
}
const rootTheme = themes.light;
css +=':root {\n';
for (const [semanticName, numericalVar] of Object.entries(semanticMapping)) {
  if (rootTheme[numericalVar]) {
    css += `  --${semanticName}: ${rootTheme[numericalVar]};\n`;
  } else {
    console.warn(`警告: 在 light 主题中找不到变量 ${numericalVar}`);
  }
}
css += '}\n\n';



fs.writeFileSync('src/styles/themes.css', css);
console.log('已生成 src/semantic-variables.css');
