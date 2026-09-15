import type { Locale, Product, User } from '@rh5/contracts';

export interface DemoUser extends User {
  password: string;
}

export const users: DemoUser[] = [
  {
    id: 1,
    username: 'user',
    password: '123456',
    realName: 'H5 User',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=h5-user',
    roles: ['user'],
  },
  {
    id: 2,
    username: 'admin',
    password: '123456',
    realName: 'Template Admin',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=h5-admin',
    roles: ['admin'],
  },
];

const baseProducts: Product[] = [
  {
    id: 1,
    title: '阳澄湖大闸蟹鲜活礼盒 4 对 8 只',
    imageUrl:
      'https://img10.360buyimg.com/n2/s400x400_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg',
    price: 388,
    memberPrice: 378,
    shopName: '湖塘烟雨生鲜店',
    shopBadge: '自营',
    delivery: '顺丰冷链',
    description: '当季鲜活捕捞，冷链直达。适合作为移动电商列表、详情与结算流程示例。',
  },
  {
    id: 2,
    title: '苏泊尔 4L 智能 IH 电饭煲',
    imageUrl:
      'https://m.360buyimg.com/mobilecms/s400x400_jfs/t1/214199/39/25134/127357/63c2b3adFed9c98f4/54126e85c23d0893.jpg!q80.dpg',
    price: 1759,
    memberPrice: 1699,
    shopName: '苏泊尔官方自营店',
    shopBadge: '品牌',
    delivery: '京东物流',
    description: '远红外加热与本釜内胆，展示商品规格、会员价与购物车数量联动。',
  },
  {
    id: 3,
    title: 'Dyson V12 Detect Slim 无绳吸尘器',
    imageUrl:
      'https://img10.360buyimg.com/pcpubliccms/s400x400_jfs/t1/414103/33/18764/70114/69eae2e4F9e33854b/00832ee3e88e35b0.jpg!q80.dpg',
    price: 3990,
    memberPrice: 3890,
    shopName: '戴森官方旗舰店',
    shopBadge: '旗舰店',
    delivery: '次日达',
    description: '激光探测微尘与智能吸力调节，适合验证长标题及高价商品的移动端布局。',
  },
  {
    id: 4,
    title: 'iPhone 17 256GB 5G 双卡双待',
    imageUrl:
      'https://m.360buyimg.com/mobilecms/s1265x1265_jfs/t20280402/412326/20/12475/54533/69cf75afFc560cac6/0a02320320cce0f2.jpg!q70.dpg.webp',
    price: 5999,
    memberPrice: 5899,
    shopName: '数码官方自营店',
    shopBadge: '自营',
    delivery: '现货速发',
    description: '用于演示商品详情、收藏、购物车和移动支付确认的完整业务链路。',
  },
  {
    id: 5,
    title: '海鲜礼品卡 年货生鲜礼盒',
    imageUrl:
      'https://m.360buyimg.com/mobilecms/s400x400_jfs/t1/181328/3/31476/203233/63b66ef1F60f5f0f8/f4e8c4b6df4194d6.jpg!q70.dpg.webp',
    price: 598,
    memberPrice: 558,
    shopName: '湖塘烟雨生鲜店',
    shopBadge: '礼赠',
    delivery: '全国可兑',
    description: '多种海产自由搭配，适合节日礼赠与兑换类业务的卡片展示。',
  },
  {
    id: 6,
    title: '城市通勤轻量双肩包 18L',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80',
    price: 329,
    memberPrice: 299,
    shopName: 'Field Notes',
    shopBadge: '新品',
    delivery: '当日发货',
    description: '适配 14 英寸电脑与短途出行，展示分页、加载更多与响应式图片能力。',
  },
];

const englishTitles = [
  'Fresh Hairy Crab Gift Box · 8 Pieces',
  'Supor 4L Smart IH Rice Cooker',
  'Dyson V12 Detect Slim Vacuum',
  'iPhone 17 256GB 5G Dual SIM',
  'Premium Seafood Gift Card',
  'City Commuter Backpack · 18L',
];

const japaneseTitles = [
  '陽澄湖 上海蟹ギフトセット 8杯',
  'SUPOR 4L スマートIH炊飯器',
  'Dyson V12 Detect Slim コードレス掃除機',
  'iPhone 17 256GB 5G デュアルSIM',
  'プレミアム海鮮ギフトカード',
  'シティコミューター バックパック 18L',
];

const traditionalTitles = [
  '陽澄湖大閘蟹鮮活禮盒 4 對 8 隻',
  '蘇泊爾 4L 智慧 IH 電飯煲',
  'Dyson V12 Detect Slim 無線吸塵器',
  'iPhone 17 256GB 5G 雙卡雙待',
  '海鮮禮品卡 年貨生鮮禮盒',
  '城市通勤輕量雙肩包 18L',
];

const localizedCopy = {
  'en-US': {
    badges: ['Direct', 'Brand', 'Flagship', 'Direct', 'Gift', 'New'],
    deliveries: [
      'SF cold chain',
      'JD Logistics',
      'Next-day delivery',
      'Ready to ship',
      'Redeem nationwide',
      'Ships today',
    ],
    descriptions: [
      'Fresh seasonal catch delivered by cold chain, ideal for testing mobile catalog, detail and checkout flows.',
      'Smart infrared heating demonstrates specifications, member pricing and cart quantity updates.',
      'Laser dust detection and adaptive suction are useful for validating long titles and premium pricing.',
      'A complete demo path covering product details, favorites, cart and mobile payment confirmation.',
      'Flexible seafood combinations for demonstrating gift and redemption business cards.',
      'Fits a 14-inch laptop and showcases pagination, load-more behavior and responsive imagery.',
    ],
  },
  'ja-JP': {
    badges: ['直営', 'ブランド', '公式店', '直営', 'ギフト', '新商品'],
    deliveries: ['コールドチェーン', 'JD 配送', '翌日配送', '即納', '全国交換可能', '当日発送'],
    descriptions: [
      '旬の上海蟹を冷蔵配送。モバイルの商品一覧、詳細、購入フローの確認に適しています。',
      '遠赤外線加熱を備え、仕様、会員価格、カート数量の連動を確認できます。',
      'レーザー微粒子検知と自動吸引力調整で、長い商品名と高価格表示を確認できます。',
      '商品詳細、お気に入り、カート、モバイル決済確認までの一連のデモです。',
      'ギフトや交換型ビジネスのカード表示に適した海鮮ギフトです。',
      '14インチ PC に対応し、ページング、追加読込、レスポンシブ画像を確認できます。',
    ],
  },
  traditional: {
    badges: ['自營', '品牌', '旗艦店', '自營', '禮贈', '新品'],
    deliveries: ['順豐冷鏈', '京東物流', '次日達', '現貨速發', '全國可兌', '當日發貨'],
    descriptions: [
      '當季鮮活捕撈，冷鏈直達。適合作為行動電商列表、詳情與結帳流程範例。',
      '遠紅外加熱與本釜內膽，展示商品規格、會員價與購物車數量聯動。',
      '雷射探測微塵與智慧吸力調節，適合驗證長標題及高價商品的行動版面。',
      '用於展示商品詳情、收藏、購物車和行動支付確認的完整業務鏈路。',
      '多種海產自由搭配，適合節日禮贈與兌換類業務的卡片展示。',
      '適配 14 吋電腦與短途出行，展示分頁、載入更多與響應式圖片能力。',
    ],
  },
} as const;

export function productsForLocale(locale: Locale): Product[] {
  if (locale === 'zh-CN') return baseProducts;
  const isTraditional = locale === 'zh-HK' || locale === 'zh-TW';
  const titles = isTraditional
    ? traditionalTitles
    : locale === 'ja-JP'
      ? japaneseTitles
      : englishTitles;
  const copy = isTraditional ? localizedCopy.traditional : localizedCopy[locale];
  return baseProducts.map((product, index) => ({
    ...product,
    description: copy.descriptions[index] ?? product.description,
    delivery: copy.deliveries[index] ?? product.delivery,
    shopBadge: copy.badges[index] ?? product.shopBadge,
    title: titles[index] ?? product.title,
  }));
}

export function publicUser(user: DemoUser): User {
  return {
    id: user.id,
    username: user.username,
    realName: user.realName,
    avatar: user.avatar,
    roles: user.roles,
  };
}
