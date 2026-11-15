import { useEffect, useRef, useState } from 'react';
import { store, useStore } from '../lib/store.js';
import { localAnswer } from '../lib/localAnswer.js';
import { profile } from '../data/profile.js';

const SUGGESTIONS = [
  'What does he do at iMerit?',
  'Which projects use computer vision?',
  'What are his strongest skills?',
  'How can I contact him?',
];

const GREETING = {
  role: 'assistant',
  content: `Hi! I’m an AI guide trained on ${profile.shortName}’s resume. Ask me about his projects, skills, experience or how to reach him.`,
};

export default function Chat() {
  const open = useStore((s) => s.chatOpen);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const setOpen = (v) => store.set({ chatOpen: v });

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && store.get().chatOpen && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function ask(text) {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    const history = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);

    const write = (content) =>
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: 'assistant', content };
        return copy;
      });

    try {
      if (offline) throw new Error('offline');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(1) }),
      });
      if (!res.ok || !res.body) throw new Error(`status ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        write(acc);
      }
      if (!acc) throw new Error('empty');
    } catch {
      // No API key, network trouble or quota hit: answer from the local resume index.
      setOffline(true);
      write(localAnswer(q));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={launcherRef}
        className={`chat-launcher ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="pulse" aria-hidden="true" />
        Ask about Sivaganesh
      </button>

      <div className={`chat ${open ? 'open' : ''}`} role="dialog" aria-modal="false" aria-label="Chat about Sivaganesh" hidden={!open}>
        <div className="chat-head">
          <div>
            <p className="chat-title">Ask about Sivaganesh</p>
            <p className="chat-note">{offline ? 'Quick answers from his resume' : 'AI answers based on his resume. Confirm details with him.'}</p>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>

        <div className="chat-list" ref={listRef} aria-live="polite" data-lenis-prevent>
          {messages.map((m, i) => (
            <p key={i} className={`msg ${m.role}`}>
              {m.content || <span className="typing" aria-label="Thinking"><i /><i /><i /></span>}
            </p>
          ))}
          {messages.length === 1 && (
            <div className="suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">Your question</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !input.trim()}>Send</button>
        </form>
      </div>
    </>
  );
}
