import { InterfaceIcon } from './InterfaceIcon.jsx';
import React from 'react';
import { ZoneDetail } from './ZoneDetail.jsx';
export function SelectionPanel({ detailProps, close }) {
  return (
    <section
      className="desktop-selection"
      role="dialog"
      aria-modal="false"
      aria-label="Selected area details"
    >
      <div className="selection-bar">
        <h2>Area details</h2>
        <button className="icon-button" aria-label="Close area details" onClick={close}>
          <InterfaceIcon name="close" />
        </button>
      </div>
      <ZoneDetail {...detailProps} id="drawer-zone" />
    </section>
  );
}
