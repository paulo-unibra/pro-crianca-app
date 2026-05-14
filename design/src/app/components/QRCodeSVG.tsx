// Fake QR code component for Pix payment display

const PATTERN: number[][] = [
  [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,1,0,0,1,0,1,0,1,1,0,1,0,1,1],
  [0,1,0,0,1,0,0,0,1,1,0,1,0,1,0,0,1,0,1,0,0],
  [1,1,0,1,0,1,1,0,0,0,1,0,1,0,1,0,0,1,0,1,1],
  [0,0,1,0,1,0,0,1,1,1,0,1,0,1,0,1,1,0,1,0,0],
  [1,0,0,1,0,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,1,0,1,0,0],
  [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,0],
  [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,0,1,0,1,1],
  [1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,0],
  [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,0,1,0,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,0],
  [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,1,0,1,0,1,1],
];

interface QRCodeSVGProps {
  size?: number;
  color?: string;
}

export function QRCodeSVG({ size = 200, color = "#1565C0" }: QRCodeSVGProps) {
  const cols = PATTERN[0].length;
  const rows = PATTERN.length;
  const cellSize = size / (cols + 2);
  const offset = cellSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <rect width={size} height={size} fill="white" rx="12" />
      {PATTERN.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (!cell) return null;
          return (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={offset + colIdx * cellSize}
              y={offset + rowIdx * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color}
              rx={1}
            />
          );
        })
      )}
      {/* Center logo */}
      <rect
        x={size / 2 - 14}
        y={size / 2 - 14}
        width={28}
        height={28}
        fill="white"
        rx={6}
      />
      <rect
        x={size / 2 - 11}
        y={size / 2 - 11}
        width={22}
        height={22}
        fill="#FFD600"
        rx={5}
      />
      <text
        x={size / 2}
        y={size / 2 + 6}
        textAnchor="middle"
        style={{ fontSize: "14px", fontFamily: "sans-serif" }}
      >
        🌟
      </text>
    </svg>
  );
}
