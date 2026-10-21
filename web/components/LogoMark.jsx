import React from 'react';

export function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="hearth-logo-mark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M50 10 L87 38 Q90 40.5 90 44 L90 83 Q90 90 83 90 L17 90 Q10 90 10 83 L10 44 Q10 40.5 13 38 Z"
        fill="#B4441C"
      />
      <g transform="translate(50 55) scale(.62) translate(-50 -51)">
        <path
          d={
            "M50 20 C59 33 71 44 71 60 C71 73 61 82 50 82 C39 82 29 73 29 60 " +
            "C29 50 35 43 40 37 C41 45 44 50 48 52 C46 42 46 31 50 20 Z"
          }
          fill="#F6F3EE"
        />
        <path
          d="M50 52 C55 58 60 62 60 68 C60 74 55 78 50 78 C45 78 40 74 40 68 C40 63 45 58 50 52 Z"
          fill="#B4441C"
        />
      </g>
    </svg>
  );
}
