'use client';

import {
  Button,
  Checkbox,
  ConfigProvider,
  Dialog,
  Empty,
  ErrorBlock,
  InfiniteScroll,
  Input,
  NavBar,
  Picker,
  PullToRefresh,
  Radio,
  Skeleton,
  Stepper,
  TabBar,
  TextArea,
  Toast,
  unstableSetRender,
} from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US';
import jaJP from 'antd-mobile/es/locales/ja-JP';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import zhHK from 'antd-mobile/es/locales/zh-HK';
import zhTW from 'antd-mobile/es/locales/zh-TW';
import { useMemo, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { Locale } from '@rh5/contracts';
import type { UiKit } from '@rh5/mobile-ui/ui';

const roots = new WeakMap<Element | DocumentFragment, Root>();

unstableSetRender((node, container) => {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
    roots.delete(container);
  };
});

const locales = { 'en-US': enUS, 'ja-JP': jaJP, 'zh-CN': zhCN, 'zh-HK': zhHK, 'zh-TW': zhTW };

function Provider({ children, locale }: { children: ReactNode; locale: Locale }) {
  return <ConfigProvider locale={locales[locale]}>{children}</ConfigProvider>;
}

export const antdMobileKit: UiKit = {
  name: 'Ant Design Mobile',
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
    ...rest
  }) => (
    <Button
      {...rest}
      block={block}
      className={className}
      color={tone === 'primary' ? 'primary' : tone === 'danger' ? 'danger' : 'default'}
      disabled={disabled}
      fill={tone === 'text' ? 'none' : 'solid'}
      loading={loading}
      onClick={onClick}
      size={size === 'medium' ? 'middle' : size}
      type={type}
    >
      {children}
    </Button>
  ),
  Checkbox: ({ checked, children, onChange, ...rest }) => (
    <Checkbox {...rest} checked={checked} onChange={onChange}>
      {children}
    </Checkbox>
  ),
  EmptyState: ({ description, icon }) => <Empty description={description} image={icon} />,
  ErrorState: ({ action, description, title }) => (
    <ErrorBlock description={description} title={title}>
      {action}
    </ErrorBlock>
  ),
  InfiniteScroll: ({ children, hasMore, loadMore }) => (
    <>
      <InfiniteScroll hasMore={hasMore} loadMore={loadMore} />
      {children}
    </>
  ),
  Input: ({ onChange, ...props }) => <Input {...props} onChange={onChange} />,
  LanguagePicker: ({ description, icon, label, onChange, options, title, value }) => {
    const columns = useMemo(() => [options], [options]);
    return (
      <Picker
        columns={columns}
        title={title}
        value={[value]}
        onConfirm={(next) => onChange(next[0] as Locale)}
      >
        {(items, actions) => (
          <button className="language-picker-trigger" type="button" onClick={actions.open}>
            <span className="language-picker-copy">
              {icon}
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
            </span>
            <span className="language-picker-value">{items[0]?.label ?? options[0]?.label}</span>
          </button>
        )}
      </Picker>
    );
  },
  NavBar: ({ back = true, onBack, title }) => (
    <NavBar back={back ? undefined : null} onBack={onBack}>
      {title}
    </NavBar>
  ),
  PullToRefresh: ({ children, onRefresh }) => (
    <PullToRefresh onRefresh={onRefresh}>{children}</PullToRefresh>
  ),
  Radio: ({ checked, children, onChange, value }) => (
    <Radio checked={checked} onChange={onChange} value={value}>
      {children}
    </Radio>
  ),
  Skeleton: ({ className }) => <Skeleton animated className={className} />,
  Stepper: ({ max, min, onChange, value }) => (
    <Stepper max={max} min={min} onChange={onChange} value={value} />
  ),
  TabBar: ({ activeKey, items, onChange }) => (
    <TabBar activeKey={activeKey} onChange={onChange} safeArea>
      {items.map((item) => (
        <TabBar.Item
          key={item.key}
          icon={item.icon}
          title={item.label}
          badge={item.badge || undefined}
        />
      ))}
    </TabBar>
  ),
  TextArea: ({ onEnter, ...props }) => (
    <TextArea {...props} autoSize={{ minRows: 1, maxRows: 4 }} onEnterPress={onEnter} />
  ),
  confirm: (message) => Dialog.confirm({ content: message }),
  toast: (message, tone) =>
    Toast.show({
      content: message,
      icon: tone === 'success' ? 'success' : tone === 'error' ? 'fail' : undefined,
    }),
};
