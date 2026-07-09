import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'white'
export type ButtonSize = 'default' | 'small' | 'x_small' | 'icon'

const BASE =
  'tw:rounded-lg tw:font-medium tw:transition-colors tw:inline-flex tw:items-center ' +
  'tw:justify-center tw:gap-2 tw:cursor-pointer tw:flex-shrink-0 tw:disabled:opacity-50 ' +
  'tw:disabled:cursor-not-allowed tw:disabled:active:translate-y-0 tw:active:translate-y-px ' +
  'tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2'

const SIZES: Record<ButtonSize, string> = {
  default: 'tw:px-3 tw:py-2 tw:text-sm',
  small: 'tw:px-3 tw:py-2 tw:text-xs',
  x_small: 'tw:px-2 tw:py-1 tw:gap-1 tw:text-xs',
  icon: 'tw:p-2 tw:text-sm',
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'tw:bg-primary tw:hover:bg-primary/90 tw:text-white',
  secondary: 'tw:border tw:border-default tw:bg-white tw:hover:bg-hover tw:text-primary',
  success: 'tw:bg-success tw:border tw:border-success tw:text-success tw:hover:brightness-95',
  danger: 'tw:bg-error tw:border tw:border-error tw:text-error tw:hover:brightness-95',
  white: 'tw:text-primary tw:bg-white tw:hover:text-link',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'default',
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cx(BASE, SIZES[size], VARIANTS[variant], className)} {...rest}>
      {icon}
      {children}
    </button>
  )
}
