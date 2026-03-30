import React from 'react';
import Navbar from '../Navbar';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export const DashboardShell = ({ children, className = '', contentClassName = '' }) => (
  <div className={cx('ui-shell', className)}>
    <Navbar />
    <div className={cx('ui-container', contentClassName)}>{children}</div>
  </div>
);

export const PageHeader = ({ icon: Icon, badge, title, subtitle, actions, className = '' }) => (
  <header className={cx('ui-header', className)}>
    <div className='min-w-0'>
      {badge && <p className='ui-badge'>{badge}</p>}
      <div className='mt-2 flex items-center gap-3'>
        {Icon && (
          <span className='ui-icon-wrap'>
            <Icon className='h-5 w-5' />
          </span>
        )}
        <h1 className='ui-title truncate'>{title}</h1>
      </div>
      {subtitle && <p className='ui-subtitle mt-2 max-w-3xl'>{subtitle}</p>}
    </div>
    {actions && <div className='flex flex-wrap items-center gap-2'>{actions}</div>}
  </header>
);

export const SurfaceCard = ({ children, className = '', ...props }) => (
  <section className={cx('ui-card', className)} {...props}>
    {children}
  </section>
);

export const GlassPanel = ({ children, className = '', ...props }) => (
  <section className={cx('ui-glass', className)} {...props}>
    {children}
  </section>
);

export const PrimaryButton = ({ className = '', type = 'button', children, ...props }) => (
  <button type={type} className={cx('ui-btn ui-btn-primary', className)} {...props}>
    {children}
  </button>
);

export const SecondaryButton = ({ className = '', type = 'button', children, ...props }) => (
  <button type={type} className={cx('ui-btn ui-btn-secondary', className)} {...props}>
    {children}
  </button>
);

export const DangerButton = ({ className = '', type = 'button', children, ...props }) => (
  <button type={type} className={cx('ui-btn ui-btn-danger', className)} {...props}>
    {children}
  </button>
);

export const Input = ({ className = '', ...props }) => <input className={cx('ui-input', className)} {...props} />;

export const Select = ({ className = '', children, ...props }) => (
  <select className={cx('ui-input', className)} {...props}>
    {children}
  </select>
);

export const TextArea = ({ className = '', ...props }) => <textarea className={cx('ui-input', className)} {...props} />;

export const EmptyState = ({ title, description }) => (
  <div className='ui-empty-state'>
    <h3 className='text-lg font-semibold text-slate-100'>{title}</h3>
    {description && <p className='mt-2 text-sm text-slate-400'>{description}</p>}
  </div>
);

export default DashboardShell;
