'use client';

import {
  Button,
  Checkbox,
  ConfigProvider,
  Dialog,
  Empty,
  InfiniteLoading,
  Input,
  InputNumber,
  NavBar,
  Picker,
  PullToRefresh,
  Radio,
  Skeleton,
  Tabbar,
  TabbarItem,
  TextArea,
  Toast,
} from '@nutui/nutui-react';
import enUS from '@nutui/nutui-react/dist/es/locales/en-US';
import jaJP from '@nutui/nutui-react/dist/es/locales/ja-JP';
import zhCN from '@nutui/nutui-react/dist/es/locales/zh-CN';
import zhTW from '@nutui/nutui-react/dist/es/locales/zh-TW';
import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';

import type { Locale } from '@rh5/contracts';
import type { UiKit } from '@rh5/mobile-ui/ui';

const locales = { 'en-US': enUS, 'ja-JP': jaJP, 'zh-CN': zhCN, 'zh-HK': zhTW, 'zh-TW': zhTW };

function Provider({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <ConfigProvider
      locale={locales[locale]}
      theme={{ nutuiColorPrimary: '#4169e1', nutuiButtonBorderRadius: '14px' }}
    >
      {children}
    </ConfigProvider>
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
  const columns = useMemo(() => [options], [options]);
  const selected = options.find((option) => option.value === value);
  return (
    <>
      <Button className="language-picker-trigger" fill="none" onClick={() => setVisible(true)}>
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
        options={columns}
        title={title}
        value={[value]}
        visible={visible}
        onCancel={() => setVisible(false)}
        onClose={() => setVisible(false)}
        onConfirm={(_, values) => {
          onChange(values[0] as Locale);
          setVisible(false);
        }}
      />
    </>
  );
}

export const nutuiKit: UiKit = {
  name: 'NutUI React',
  Provider,
  Button: ({
    block,
    children,
    className,
    disabled,
    loading,
    onClick,
    size,
    tone = 'default',
    type,
  }) => (
    <Button
      block={block}
      className={className}
      disabled={disabled}
      fill={tone === 'text' ? 'none' : tone === 'default' ? 'outline' : 'solid'}
      loading={loading}
      nativeType={type}
      onClick={onClick}
      size={size === 'medium' ? 'normal' : size}
      type={tone === 'primary' ? 'primary' : tone === 'danger' ? 'danger' : 'default'}
    >
      {children}
    </Button>
  ),
  Checkbox: ({ checked, children, onChange, ...rest }) => (
    <Checkbox {...rest} checked={checked} label={children} onChange={onChange} />
  ),
  EmptyState: ({ description, icon }) => <Empty description={description} image={icon} />,
  ErrorState: ({ action, description, title }) => (
    <div className="ui-error-state">
      <Empty status="network" title={title} description={description} />
      {action}
    </div>
  ),
  InfiniteScroll: ({ children, hasMore, loadMore }) => (
    <>
      <InfiniteLoading hasMore={hasMore} onLoadMore={async () => await loadMore()} />
      {children}
    </>
  ),
  Input: ({ onBlur, onChange, onFocus, ...props }) => (
    <Input
      {...props}
      onBlur={() => onBlur?.({} as never)}
      onChange={onChange}
      onFocus={() => onFocus?.({} as never)}
    />
  ),
  LanguagePicker,
  NavBar: ({ back = true, onBack, title }) => (
    <NavBar back={back ? '‹' : null} onBackClick={onBack} title={title} />
  ),
  PullToRefresh: ({ children, onRefresh }) => (
    <PullToRefresh onRefresh={onRefresh}>{children}</PullToRefresh>
  ),
  Radio: ({ checked, children, onChange, value }) => (
    <Radio checked={checked} onChange={onChange} value={value}>
      {children}
    </Radio>
  ),
  Skeleton: ({ className }) => (
    <div className={className}>
      <Skeleton animated rows={3} />
    </div>
  ),
  Stepper: ({ max, min, onChange, value }) => (
    <InputNumber max={max} min={min} onChange={(next) => onChange(Number(next))} value={value} />
  ),
  TabBar: ({ activeKey, items, onChange }) => {
    const index = Math.max(
      0,
      items.findIndex((item) => item.key === activeKey),
    );
    return (
      <Tabbar
        value={index}
        onSwitch={(next) => onChange(items[next]?.key ?? items[0]?.key ?? '/home')}
        safeArea
      >
        {items.map((item) => (
          <TabbarItem key={item.key} icon={item.icon} title={item.label} value={item.badge} />
        ))}
      </Tabbar>
    );
  },
  TextArea: ({ onEnter, ...props }) => (
    <TextArea
      {...props}
      autoSize
      rows={1}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onEnter?.(event);
      }}
    />
  ),
  confirm: (message) =>
    new Promise((resolve) => {
      Dialog.confirm({
        content: message,
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
      });
    }),
  toast: (message, tone) =>
    Toast.show({
      content: message,
      icon: tone === 'success' ? 'success' : tone === 'error' ? 'fail' : undefined,
    }),
};
