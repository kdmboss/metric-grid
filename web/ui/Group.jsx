import React from 'react';
import { Icon, IconTile } from './Icon.jsx';

/** Settings-style grouped container with an optional header above and a footnote below. */
export function Group({ title, footer, children, className = '', as: Tag = 'section', ...rest }) {
  return (
    <Tag className={`ios-group-wrap ${className}`} {...rest}>
      {title && <h3 className="ios-section-title">{title}</h3>}
      <div className="ios-group">{children}</div>
      {footer && <p className="ios-section-footer">{footer}</p>}
    </Tag>
  );
}

/** 44px+ row: optional icon tile, title, trailing value, chevron when tappable. */
export function Row({
  icon,
  tone,
  title,
  detail,
  value,
  onClick,
  href,
  external,
  children,
  className = '',
  ...rest
}) {
  const body = (
    <>
      {icon && <IconTile name={icon} tone={tone} />}
      <span className="ios-row-body">
        <span className="ios-row-title">{title}</span>
        {detail && <span className="ios-row-detail">{detail}</span>}
      </span>
      {value != null && <span className="ios-row-value">{value}</span>}
      {children}
      {(onClick || href) && (
        <Icon
          name={external ? 'external' : 'chevron'}
          size={external ? 16 : 18}
          className="ios-chevron"
        />
      )}
    </>
  );
  if (href)
    return (
      <a className={`ios-row ${className}`} href={href} target="_blank" rel="noreferrer" {...rest}>
        {body}
      </a>
    );
  if (onClick)
    return (
      <button type="button" className={`ios-row ${className}`} onClick={onClick} {...rest}>
        {body}
      </button>
    );
  return (
    <div className={`ios-row ${className}`} {...rest}>
      {body}
    </div>
  );
}

/** Number with its unit set smaller in the secondary label color. */
export function Quantity({ value, unit }) {
  return (
    <span className="ios-quantity">
      {value}
      {unit && <small>{unit}</small>}
    </span>
  );
}
