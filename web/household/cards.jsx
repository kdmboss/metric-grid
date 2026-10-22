import React from 'react';
import { Icon } from '../ui/Icon.jsx';
import { Group, Row } from '../ui/Group.jsx';
import { NEED_LABEL, needReasons } from './household.js';

/** Home card: need level and generic reason chips only (no health detail on a screen others may see). */
export function NeedCard({ level, answers, onOpen }) {
  const reasons = needReasons(answers);
  return (
    <button type="button" className="home-card need-card" data-level={level} onClick={onOpen}>
      <span className="card-head">
        <span className="need-title">
          <span className="need-dot" aria-hidden="true" />
          {NEED_LABEL[level]}
        </span>
        <Icon name="chevron" size={18} className="ios-chevron" />
      </span>
      {reasons.length > 0 && (
        <span className="reason-chips">
          {reasons.map((r) => (
            <i key={r}>{r}</i>
          ))}
        </span>
      )}
      <span className="card-foot">
        Based on your answers. Not a medical or official assessment.
      </span>
    </button>
  );
}
export function OfficialListsCard({ onOpen }) {
  return (
    <button type="button" className="home-card official-card" onClick={onOpen}>
      <span className="card-head">
        <span className="card-title">
          <Icon name="list" size={20} /> Get on the official lists
        </span>
        <Icon name="chevron" size={18} className="ios-chevron" />
      </span>
    </button>
  );
}
/** Pushed screen: only verified programs, each opening in the in-app browser. */
export function OfficialLists({ rows }) {
  return (
    <div className="official-lists">
      <Group>
        {rows.map((row) => (
          <Row key={row.id} icon={row.icon} title={row.title} detail={row.detail} href={row.href} />
        ))}
      </Group>
      <p className="ios-section-footer">
        HEARTH doesn’t sign you up or share your answers. These links go to the official programs.
      </p>
    </div>
  );
}
