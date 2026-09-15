'use client';

import {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type ComponentType,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import type { Locale } from '@rh5/contracts';

export interface UiButtonProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children' | 'className' | 'disabled' | 'onClick' | 'type'
> {
  block?: boolean;
  loading?: boolean;
  size?: 'large' | 'medium' | 'small';
  tone?: 'danger' | 'default' | 'primary' | 'text';
}

export interface UiInputProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-invalid' | 'autoComplete' | 'name' | 'onBlur' | 'onFocus' | 'placeholder' | 'type'
> {
  onChange?: (value: string) => void;
  value?: string;
}

export interface UiTextAreaProps extends Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'aria-label' | 'disabled' | 'name' | 'onBlur' | 'onFocus' | 'placeholder'
> {
  maxLength?: number;
  onChange?: (value: string) => void;
  onEnter?: (event: { preventDefault: () => void; shiftKey: boolean }) => void;
  value?: string;
}

export interface UiCheckboxProps {
  'aria-label'?: string;
  checked: boolean;
  children?: ReactNode;
  onChange: (checked: boolean) => void;
}

export interface UiStepperProps {
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}

export interface UiNavItem {
  badge?: number;
  icon: ReactNode;
  key: string;
  label: string;
}

export interface UiLanguageOption {
  label: string;
  value: Locale;
}

export interface UiKit {
  name: string;
  Button: ComponentType<UiButtonProps>;
  Checkbox: ComponentType<UiCheckboxProps>;
  EmptyState: ComponentType<{ description: string; icon?: ReactNode }>;
  ErrorState: ComponentType<{ action?: ReactNode; description?: string; title: string }>;
  InfiniteScroll: ComponentType<{
    children?: ReactNode;
    hasMore: boolean;
    loadMore: () => Promise<void>;
  }>;
  Input: ComponentType<UiInputProps>;
  LanguagePicker: ComponentType<{
    description: string;
    icon?: ReactNode;
    label: string;
    onChange: (locale: Locale) => void;
    options: UiLanguageOption[];
    title: string;
    value: Locale;
  }>;
  NavBar: ComponentType<{ back?: boolean; onBack: () => void; title: string }>;
  Provider: ComponentType<{ children: ReactNode; locale: Locale }>;
  PullToRefresh: ComponentType<{ children: ReactNode; onRefresh: () => Promise<unknown> }>;
  Radio: ComponentType<{
    checked: boolean;
    children: ReactNode;
    onChange: () => void;
    value: string;
  }>;
  Skeleton: ComponentType<{ className?: string }>;
  Stepper: ComponentType<UiStepperProps>;
  TabBar: ComponentType<{
    activeKey: string;
    items: UiNavItem[];
    onChange: (key: string) => void;
  }>;
  TextArea: ComponentType<UiTextAreaProps>;
  confirm: (message: string) => Promise<boolean>;
  toast: (message: string, tone?: 'error' | 'success') => void;
}

const UiContext = createContext<UiKit | null>(null);

export function UiProvider({ children, kit }: { children: ReactNode; kit: UiKit }) {
  return <UiContext.Provider value={kit}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error('UiProvider is missing');
  return value;
}
