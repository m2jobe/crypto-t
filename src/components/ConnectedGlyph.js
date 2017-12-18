import React from 'react';

const ConnectedGlyph = ({ connected }) => (
  <div className="absolute">
    <div className="connected-glyph">
      <span className="">Realtime data</span>
      <span
        className={`glyphicon glyphicon-dot chart-header-item
          ${connected ? 'connected' : ''}`
        }
      />
    </div>
  </div>
);

export default ConnectedGlyph;

