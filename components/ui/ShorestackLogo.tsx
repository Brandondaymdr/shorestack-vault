'use client';

interface ShorestackLogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark';
  subbrand?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ShorestackLogo({
  variant = 'horizontal',
  subbrand,
  color = '#1b4965',
  size = 'md',
}: ShorestackLogoProps) {
  // Size mappings
  const sizeMap = {
    sm: { mark: 24, wordmark: 14, text: 12 },
    md: { mark: 32, wordmark: 18, text: 14 },
    lg: { mark: 48, wordmark: 28, text: 20 },
  };

  const dims = sizeMap[size];

  // Wave mark: 11 sinusoidal lines in a square frame
  const WaveMark = () => {
    const width = dims.mark;
    const height = dims.mark;
    const lineCount = 11;
    const lineSpacing = width / (lineCount - 1);
    const amplitude = height * 0.3;
    const frequency = Math.PI / height;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
        {/* Generate 11 sinusoidal lines */}
        {Array.from({ length: lineCount }).map((_, i) => {
          const x = i * lineSpacing;
          const points = Array.from({ length: 100 }).map((_, j) => {
            const y = (height / 2) + amplitude * Math.sin(j * frequency);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polyline
              key={i}
              points={points}
              stroke={color}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  };

  // Wordmark text
  const Wordmark = ({ text, color: textColor }: { text: string; color: string }) => (
    <svg
      width={dims.wordmark * 4}
      height={dims.wordmark}
      viewBox="0 0 120 30"
      fill="none"
      fontSize={dims.wordmark}
      fontFamily="Inter, sans-serif"
      fontWeight="600"
    >
      <text x="0" y="22" fill={textColor} fontSize={dims.wordmark} fontFamily="Inter, sans-serif" fontWeight="600">
        {text}
      </text>
    </svg>
  );

  if (variant === 'mark') {
    return <WaveMark />;
  }

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col items-center gap-2">
        <WaveMark />
        <div className="text-center">
          <div style={{ fontSize: dims.wordmark, fontFamily: 'Inter, sans-serif', fontWeight: 600, color }}>
            shorestack
          </div>
          {subbrand && (
            <div style={{ fontSize: dims.text * 0.75, fontFamily: 'Inter, sans-serif', color: '#5fa8a0', marginTop: '2px' }}>
              {subbrand}
            </div>
          )}
        </div>
      </div>
    );
  }

  // horizontal
  return (
    <div className="flex items-center gap-2">
      <WaveMark />
      <div>
        <div style={{ fontSize: dims.wordmark, fontFamily: 'Inter, sans-serif', fontWeight: 600, color, lineHeight: 1 }}>
          shorestack
        </div>
        {subbrand && (
          <div style={{ fontSize: dims.text * 0.65, fontFamily: 'Inter, sans-serif', color: '#5fa8a0', lineHeight: 1, marginTop: '2px' }}>
            {subbrand}
          </div>
        )}
      </div>
    </div>
  );
}
