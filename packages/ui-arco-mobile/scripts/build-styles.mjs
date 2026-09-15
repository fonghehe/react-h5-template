// 生成 packages/ui-arco-mobile/src/styles.css
//
// Arco Design Mobile 的样式以 rem 编写，设计基准为 375px 视口、
// 1rem = 屏宽 / 7.5 = 50px（lib-flexible 约定），要求在 html 上做 rem 适配。
// 本模板的 html font-size 保持 16px（Tailwind 依赖），因此不能做全局 rem 适配，
// 改为在构建期把 arco 样式中的 rem 按 1rem = 50px 换算成固定 px。
//
// 用法：node scripts/build-styles.mjs（在 packages/ui-arco-mobile 目录下执行）
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const arcoCssPath = require.resolve('@arco-design/mobile-react/dist/style.min.css');
const css = readFileSync(arcoCssPath, 'utf8');

const REM_BASE = 50; // 375 设计稿下 1rem = 50px

const converted = css.replace(/(-?\d*\.?\d+)rem\b/g, (_, num) => {
  const px = Number(num) * REM_BASE;
  const rounded = Math.round(px * 100) / 100;
  return `${rounded}px`;
});

const overrides = `
/* ==== 以下为模板追加的跨端对齐修正 ==== */
/* arco 按钮默认块级全宽，与另两套 UI 的内联语义不一致；block 场景由内联样式控制 */
.arco-button {
  display: inline-flex;
  width: auto;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
`;

writeFileSync(
  new URL('../src/styles.css', import.meta.url),
  `/*\n * 自动生成：勿手改。来源 ${arcoCssPath.replace(process.cwd(), '.')}\n * 由 scripts/build-styles.mjs 按 1rem = ${REM_BASE}px（375 设计稿）转换。\n */\n${converted}${overrides}`,
);

console.log('styles.css generated');
