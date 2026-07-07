import { useEffect, useState } from 'react';
import type { ReminderPayload } from './shared/contracts';

const defaultReminder: ReminderPayload = {
  title: 'Continue Breaking Ice redesign',
  subtitle: 'Focus block starts now',
};

function OverlayView() {
  const [reminder, setReminder] = useState<ReminderPayload>(defaultReminder);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return window.pikaBoo.onOverlayShow((payload) => {
      setReminder(payload);
      setVisible(false);

      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
  }, []);

  return (
    <div className="overlay-shell">
      <div className={`overlay-banner ${visible ? 'overlay-banner--visible' : ''}`}>
        <div className="overlay-banner__icon">👀</div>
        <div>
          <div className="overlay-banner__title">{reminder.title}</div>
          <div className="overlay-banner__subtitle">{reminder.subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function ControlPanel() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Ambient desktop reminders</p>
        <h1>Pika-Boo</h1>
        <p className="lede">
          Google Calendar reminders later. Right now the scaffold proves the tray flow and moving
          top-banner overlay.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => void window.pikaBoo.showOverlayDemo()}>
            Play overlay demo
          </button>
        </div>
      </section>

      <section className="status-grid">
        <article className="status-card">
          <h2>Scaffold status</h2>
          <ul>
            <li>Electron main process wired</li>
            <li>Tray menu wired</li>
            <li>Transparent overlay window wired</li>
          </ul>
        </article>
        <article className="status-card">
          <h2>Next build slice</h2>
          <ul>
            <li>Google OAuth</li>
            <li>Calendar polling</li>
            <li>Real reminder scheduling</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

export default function App() {
  return window.location.hash === '#overlay' ? <OverlayView /> : <ControlPanel />;
}
