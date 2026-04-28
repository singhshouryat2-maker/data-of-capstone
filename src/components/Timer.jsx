import { useMemo } from 'react';
import './Timer.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const PRESETS = [
  { label: '15m', value: 15 },
  { label: '25m', value: 25 },
  { label: '45m', value: 45 },
  { label: '60m', value: 60 },
];

export default function Timer({ timer, onStart, onDistractionCount }) {
  const { timeLeft, duration, isRunning, isComplete, progress, toggle, reset, setDuration } = timer;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const statusText = useMemo(() => {
    if (isComplete) return 'Session Complete!';
    if (isRunning) return 'Stay focused...';
    if (progress > 0) return 'Paused';
    return 'Ready to focus?';
  }, [isComplete, isRunning, progress]);

  const statusClass = isComplete ? 'complete' : isRunning ? 'running' : progress > 0 ? 'paused' : 'idle';

  return (
    <div className="timer-card" id="timer-card">
      <div className="timer-header">
        <h2 className="timer-title">Focus Timer</h2>
        <div className="timer-presets">
          {PRESETS.map(p => (
            <button
              key={p.value}
              className={`preset-btn ${duration === p.value * 60 ? 'active' : ''}`}
              onClick={() => setDuration(p.value)}
              disabled={isRunning}
              id={`preset-${p.value}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`timer-ring-container ${statusClass}`}>
        {/* Ambient glow */}
        <div className="timer-ambient-glow" />

        <svg className="timer-ring" viewBox="0 0 300 300">
          {/* Background track */}
          <circle
            cx="150" cy="150" r="140"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="150" cy="150" r="140"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring"
            style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease' }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c5cfc" />
              <stop offset="50%" stopColor="#9b82fd" />
              <stop offset="100%" stopColor="#00d4aa" />
            </linearGradient>
          </defs>
        </svg>

        <div className="timer-display">
          <span className={`timer-time ${isComplete ? 'complete-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>
          <span className={`timer-status ${statusClass}`}>{statusText}</span>
        </div>

        {/* Orbiting dot when running */}
        {isRunning && (
          <div
            className="orbiting-dot"
            style={{
              transform: `rotate(${(progress / 100) * 360 - 90}deg)`,
            }}
          >
            <div className="orbit-point" />
          </div>
        )}
      </div>

      <div className="timer-controls">
        {!isComplete ? (
          <>
            <button
              className={`timer-btn ${isRunning ? 'pause' : 'start'}`}
              onClick={() => {
                if (!isRunning && progress === 0) onStart?.();
                toggle();
              }}
              id="timer-toggle-btn"
            >
              <span className="btn-icon">{isRunning ? '⏸' : '▶'}</span>
              <span>{isRunning ? 'Pause' : progress > 0 ? 'Resume' : 'Start Focus'}</span>
            </button>
            {progress > 0 && !isRunning && (
              <button className="timer-btn reset" onClick={() => reset()} id="timer-reset-btn">
                <span className="btn-icon">↺</span>
                <span>Reset</span>
              </button>
            )}
          </>
        ) : (
          <button className="timer-btn start" onClick={() => reset()} id="timer-new-session-btn">
            <span className="btn-icon">✦</span>
            <span>New Session</span>
          </button>
        )}
      </div>

      {(isRunning || isComplete) && (
        <div className="timer-stats-mini">
          <div className="mini-stat">
            <span className="mini-stat-label">Elapsed</span>
            <span className="mini-stat-value">{formatTime(duration - timeLeft)}</span>
          </div>
          <div className="mini-stat-divider" />
          <div className="mini-stat">
            <span className="mini-stat-label">Distractions</span>
            <span className="mini-stat-value distraction-count">{onDistractionCount ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
