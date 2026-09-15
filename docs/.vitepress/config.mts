import { defineConfig } from 'vitepress';

const pages = [
  'getting-started',
  'architecture',
  'frontend',
  'commerce',
  'authentication',
  'ai',
  'internationalization',
  'backend',
  'quality',
  'editor',
  'deployment',
  'roadmap',
] as const;

function navigation(prefix: string, labels: readonly string[], navLabels: readonly string[]) {
  return {
    nav: [
      { link: `${prefix}/`, text: navLabels[0] },
      { link: `${prefix}/architecture`, text: navLabels[1] },
      { link: `${prefix}/commerce`, text: navLabels[2] },
      { link: `${prefix}/backend`, text: navLabels[3] },
      { link: `${prefix}/quality`, text: navLabels[4] },
    ],
    sidebar: [
      {
        text: 'React H5 Template',
        items: [
          { link: `${prefix}/`, text: labels[0] },
          ...pages.map((page, index) => ({ link: `${prefix}/${page}`, text: labels[index + 1] })),
        ],
      },
    ],
  };
}

export default defineConfig({
  base: '/react-h5-template/',
  description: 'A full-stack React mobile web template',
  head: [['meta', { content: '#4169e1', name: 'theme-color' }]],
  lang: 'en-US',
  lastUpdated: true,
  srcDir: 'src',
  title: 'React H5 Template',
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        editLink: {
          pattern: 'https://github.com/fonghehe/react-h5-template/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },
        ...navigation(
          '',
          [
            'Overview',
            'Getting started',
            'Architecture',
            'Frontend',
            'Commerce',
            'Authentication',
            'AI streaming',
            'Internationalization',
            'Backend',
            'Quality',
            'VS Code',
            'Deployment',
            'Roadmap',
          ],
          ['Guide', 'Architecture', 'Commerce', 'Backend', 'Quality'],
        ),
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        editLink: {
          pattern: 'https://github.com/fonghehe/react-h5-template/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        ...navigation(
          '/zh',
          [
            '项目介绍',
            '快速开始',
            '架构与改进',
            '前端',
            '电商流程',
            '认证与会话',
            'AI 流式接口',
            '国际化',
            '后端与数据库',
            '工程质量',
            'VS Code',
            '部署',
            '改进路线',
          ],
          ['指南', '架构', '电商', '后端', '工程质量'],
        ),
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      themeConfig: {
        editLink: {
          pattern: 'https://github.com/fonghehe/react-h5-template/edit/main/docs/:path',
          text: 'GitHub で編集',
        },
        ...navigation(
          '/ja',
          [
            '概要',
            'はじめに',
            'アーキテクチャ',
            'フロントエンド',
            'コマース',
            '認証とセッション',
            'AI ストリーム',
            '国際化',
            'バックエンドと DB',
            '品質',
            'VS Code',
            '公開',
            '改善計画',
          ],
          ['ガイド', '構成', 'コマース', 'バックエンド', '品質'],
        ),
      },
    },
  },
  themeConfig: {
    footer: {
      copyright: 'Released under the MIT License.',
      message: 'Next.js 16 · React 19 · Mobile Web',
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/fonghehe/react-h5-template' }],
  },
});
