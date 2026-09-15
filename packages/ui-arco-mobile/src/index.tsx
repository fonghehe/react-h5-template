'use client';

import {
  Button,
  Checkbox,
  ContextProvider,
  Dialog,
  Input,
  LoadMore,
  NavBar,
  Picker,
  PullRefresh,
  Radio,
  Skeleton,
  Stepper,
  TabBar,
  Textarea,
  Toast,
} from '@arco-design/mobile-react';
import enUS from '@arco-design/mobile-utils/esm/locale/en-US.js';
import zhCN from '@arco-design/mobile-utils/esm/locale/zh-CN.js';
import zhHK from '@arco-design/mobile-utils/esm/locale/zh-HK.js';
import zhTW from '@arco-design/mobile-utils/esm/locale/zh-TW.js';
import type { ILocale } from '@arco-design/mobile-utils';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';

import type { Locale } from '@rh5/contracts';
import type { UiKit } from '@rh5/mobile-ui/ui';

const jaJP: ILocale = {
  ...enUS,
  locale: 'ja-JP',
  Dialog: { cancelText: 'キャンセル', okText: '確認' },
  Image: { loadError: '再試行' },
  ImagePicker: { loadError: '読み込みに失敗しました' },
  Keyboard: { confirm: '完了' },
  LoadMore: {
    failLoadText: '読み込みに失敗しました。タップして再試行',
    loadMoreText: 'さらに読み込む',
    loadingText: '読み込み中…',
    noDataText: 'すべて読み込みました',
    prepareClickText: 'タップ',
    prepareScrollText: '上に引く',
  },
  NavBar: { backBtnAriaLabel: '戻る' },
  Pagination: { nextPage: '次へ', previousPage: '前へ' },
  Picker: { cancelText: 'キャンセル', okText: '確認' },
  PullRefresh: {
    finishText: '更新しました',
    loadingText: '更新中…',
    loosingText: '離して更新',
    pullingText: '下に引いて更新',
  },
  SearchBar: { cancelBtn: 'キャンセル', placeholder: '検索内容を入力' },
  Stepper: { addButtonName: '増やす', minusButtonName: '減らす' },
};

const locales: Record<Locale, ILocale> = {
  'en-US': enUS,
  'ja-JP': jaJP,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
};

function TabBarImpl({ activeKey, items, onChange }: ComponentProps<UiKit['TabBar']>) {
  // 延迟挂载：arco TabBar 在 SSR 与 CSR 渲染结构不一致会导致 hydration mismatch
  // （表现为 Next dev 的 "1 Issue" 徽章），挂载后再渲染与外壳交互更稳定。
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  if (!mounted) return <div className="ui-tabbar-placeholder" />;
  return (
    <TabBar
      activeIndex={Math.max(
        0,
        items.findIndex((item) => item.key === activeKey),
      )}
      dataSource={items.map((item) => ({ badge: item.badge, icon: item.icon, title: item.label }))}
      fixed={false}
      onChange={(index) => onChange(items[index]?.key ?? items[0]?.key ?? '/home')}
    />
  );
}

function Provider({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <ContextProvider createRoot={createRoot} locale={locales[locale]} system="ios">
      {children}
    </ContextProvider>
  );
}

function LanguagePicker({
  description,
  icon,
  label,
  onChange,
  options,
  title,
  value,
}: ComponentProps<UiKit['LanguagePicker']>) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <>
      <Button className="language-picker-trigger" onClick={() => setVisible(true)}>
        <span className="language-picker-copy">
          {icon}
          <span>
            <strong>{label}</strong>
            <small>{description}</small>
          </span>
        </span>
        <span className="language-picker-value">{selected?.label}</span>
      </Button>
      <Picker
        cols={1}
        data={options}
        title={title}
        value={[value]}
        visible={visible}
        onDismiss={() => setVisible(false)}
        onHide={() => setVisible(false)}
        onOk={(next) => {
          onChange(next[0] as Locale);
          setVisible(false);
        }}
      />
    </>
  );
}

function InfiniteScroll({ hasMore, loadMore }: ComponentProps<UiKit['InfiniteScroll']>) {
  const marker = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  useEffect(() => {
    const node = marker.current;
    if (!node || !hasMore) return undefined;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting || loading.current) return;
        loading.current = true;
        try {
          await loadMore();
        } finally {
          loading.current = false;
        }
      },
      { rootMargin: '160px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);
  return (
    <div ref={marker}>
      <LoadMore status={hasMore ? 'loading' : 'nomore'} />
    </div>
  );
}

export const arcoMobileKit: UiKit = {
  name: 'Arco Design Mobile',
  Provider,
  Button: ({ block, children, className, disabled, loading, onClick, size, tone = 'default' }) => (
    <Button
      className={className}
      disabled={disabled}
      loading={loading}
      needActive
      onClick={(event) => onClick?.(event as never)}
      shape="round"
      size={size === 'medium' ? 'medium' : size}
      style={block ? { width: '100%' } : undefined}
      type={
        tone === 'text' ? 'ghost' : tone === 'primary' || tone === 'danger' ? 'primary' : 'default'
      }
      bgColor={tone === 'danger' ? '#c9453d' : undefined}
      borderColor={tone === 'danger' ? '#c9453d' : undefined}
    >
      {children}
    </Button>
  ),
  Checkbox: ({ checked, children, onChange, ...rest }) => (
    <Checkbox {...rest} checked={checked} onChange={onChange} value="checkbox">
      {children}
    </Checkbox>
  ),
  EmptyState: ({ description, icon }) => (
    <div className="ui-empty-state">
      {icon}
      <p>{description}</p>
    </div>
  ),
  ErrorState: ({ action, description, title }) => (
    <div className="ui-error-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  ),
  InfiniteScroll,
  Input: ({ onBlur, onChange, onFocus, ...props }) => (
    <Input {...props} onBlur={onBlur} onFocus={onFocus} onInput={(_, value) => onChange?.(value)} />
  ),
  LanguagePicker,
  NavBar: ({ back = true, onBack, title }) => (
    <NavBar
      leftContent={back ? undefined : null}
      onClickLeft={back ? onBack : undefined}
      title={title}
    />
  ),
  PullToRefresh: ({ children, onRefresh }) => (
    <PullRefresh
      onRefresh={async () => {
        await onRefresh();
      }}
    >
      {children}
    </PullRefresh>
  ),
  Radio: ({ checked, children, onChange, value }) => (
    <Radio checked={checked} onChange={onChange} value={value}>
      {children}
    </Radio>
  ),
  Skeleton: ({ className }) => (
    <div className={className}>
      <Skeleton paragraph={{ rows: 3 }} />
    </div>
  ),
  Stepper: ({ max, min, onChange, value }) => (
    <Stepper max={max} min={min} onChange={(next) => onChange(next ?? min ?? 1)} value={value} />
  ),
  TabBar: TabBarImpl,
  TextArea: ({ onChange, onEnter, ...props }) => (
    <Textarea
      {...props}
      autosize
      rows={1}
      onInput={(_, value) => onChange?.(value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onEnter?.(event);
      }}
    />
  ),
  confirm: (message) =>
    new Promise((resolve) => {
      Dialog.confirm({
        children: message,
        onCancel: () => resolve(false),
        onOk: () => resolve(true),
      });
    }),
  toast: (message, tone) => {
    if (tone === 'success') Toast.success(message);
    else if (tone === 'error') Toast.error(message);
    else Toast.info(message);
  },
};
