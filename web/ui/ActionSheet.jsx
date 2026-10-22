import React, { useMemo, useState } from 'react';
import { Icon, IconTile } from './Icon.jsx';
import { ModalSheet } from './ModalSheet.jsx';
import { lightImpact } from '../platform.js';

/** Bottom sheet listing options, a checkmark on the current one. Replaces every native dropdown. */
export function ActionSheet({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
  searchable = false,
  searchLabel = 'Search',
  menu = false,
}) {
  const [query, setQuery] = useState('');
  const shown = useMemo(
    () =>
      query.trim()
        ? options.filter((o) =>
            `${o.label} ${o.detail || ''}`.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options,
    [options, query],
  );
  return (
    <ModalSheet
      open={open}
      onClose={() => {
        setQuery('');
        onClose();
      }}
      title={title}
    >
      {searchable && (
        <div className="ios-search ios-search-inline">
          <Icon name="search" size={16} />
          <input
            type="search"
            aria-label={searchLabel}
            placeholder={searchLabel}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
      <div className="ios-sheet-list" role={menu ? 'menu' : 'radiogroup'} aria-label={title}>
        <div className="ios-group">
          {shown.map((option) => (
            <button
              key={option.value}
              type="button"
              role={menu ? 'menuitem' : 'radio'}
              aria-checked={menu ? undefined : option.value === value}
              className="ios-row"
              onClick={() => {
                void lightImpact();
                setQuery('');
                onSelect(option.value);
                onClose();
              }}
            >
              {option.icon && <IconTile name={option.icon} tone="ink" />}
              <span className="ios-row-body">
                <span className="ios-row-title">{option.label}</span>
                {option.detail && <span className="ios-row-detail">{option.detail}</span>}
              </span>
              {!menu && option.value === value && (
                <Icon name="check" size={20} className="ios-check" />
              )}
            </button>
          ))}
          {!shown.length && <p className="ios-row ios-row-empty">No matches.</p>}
        </div>
      </div>
    </ModalSheet>
  );
}

/** A tappable row that shows the current choice and opens an ActionSheet. */
export function PickerRow({
  label,
  title = label,
  value,
  options,
  onChange,
  icon,
  searchable,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <button
        type="button"
        className={`ios-row ios-picker ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {icon && <IconTile name={icon} />}
        <span className="ios-row-body">
          <span className="ios-row-title">{label}</span>
        </span>
        <span className="ios-row-value">{current?.short || current?.label}</span>
        <Icon name="chevron" size={18} className="ios-chevron" />
      </button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        options={options}
        value={value}
        onSelect={onChange}
        searchable={searchable}
        searchLabel={`Search ${title.toLowerCase()}`}
      />
    </>
  );
}
