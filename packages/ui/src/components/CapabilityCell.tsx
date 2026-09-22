import React from 'react';
import { CapabilityKey, CapabilityState } from '@bilgenos/contracts';
import { StatusBadge } from './StatusBadge.js';

export interface CapabilityCellProps {
  capabilityKey: CapabilityKey;
  state: CapabilityState;
  onToggleState?: (key: CapabilityKey, targetState: CapabilityState) => void;
}

export function CapabilityCell({
  capabilityKey,
  state,
  onToggleState,
}: CapabilityCellProps): React.ReactElement {
  const getBadgeVariant = (s: CapabilityState) => {
    switch (s) {
      case 'ENABLED':
        return 'success';
      case 'READ_ONLY':
        return 'info';
      case 'SUSPENDED':
        return 'warning';
      case 'DISABLED':
      default:
        return 'default';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <StatusBadge label={state} variant={getBadgeVariant(state)} />
      {onToggleState && (
        <select
          value={state}
          onChange={(e) => onToggleState(capabilityKey, e.target.value as CapabilityState)}
          style={{
            fontSize: '11px',
            padding: '2px 4px',
            border: '1px solid #D9DDE3',
            borderRadius: '0px',
            backgroundColor: '#FFFFFF',
            fontFamily: 'inherit',
          }}
        >
          <option value="ENABLED">ENABLED</option>
          <option value="READ_ONLY">READ_ONLY</option>
          <option value="DISABLED">DISABLED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      )}
    </div>
  );
}
