import { profile, skillGroups, projects, journey, certifications, hackathons, achievements } from '../data/profile.js';
import { store } from '../lib/store.js';

const openChat = () => store.set({ chatOpen: true });

export function Hero() {
  return (
    <section id="intro" data-stop="hero" className="section hero">
      <div className="panel left hero-panel">
        <p className="hero-kicker">Hi, I’m</p>
        <h1 className="hero-name">
          <span>Akula</span>
          <span>Sivaganesh</span>
        </h1>
        <p className="lead">{profile.intro}</p>
        <div className="actions">
          <a className="btn primary" href="#projects">See my projects</a>
          <button className="btn" onClick={openChat}>Ask my AI about me</button>
          <a className="btn quiet" href={profile.resume} download>Download resume</a>
        </div>
      </div>
      <p className="scroll-hint" aria-hidden="true">Scroll to travel</p>
    </section>
  );
}

export function About() {
  return (
    <section id="about" data-stop="about" className="section">
      <div className="panel left">
        <h2>I build AI apps, and I care about the data behind them.</h2>
        {profile.about.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
        <dl className="facts">
          {profile.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Skills() {
  const set = (id) => store.set({ activeSkill: id });
  return (
    <section id="skills" data-stop="skills" className="section">
      <div className="panel right">
        <h2>What I work with</h2>
        <p className="muted">Each orbit is a skill group and every moon is a tool. Point at a group to light up its orbit.</p>
        <div className="skill-groups" onMouseLeave={() => set(null)}>
          {skillGroups.map((g) => (
            <div
              key={g.id}
              className="skill-group"
              style={{ '--c': g.color }}
              tabIndex={0}
              onMouseEnter={() => set(g.id)}
              onFocus={() => set(g.id)}
              onBlur={() => set(null)}
            >
              <h3>{g.name}</h3>
              <p>{g.items.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="projects" className="projects">
      <div className="section short">
        <div className="panel left">
          <h2>Six projects, each its own world</h2>
          <p className="muted">From computer vision to full-stack web. Keep scrolling to fly past each one.</p>
        </div>
      </div>
      {projects.map((p, i) => (
        <article key={p.title} data-stop={`project-${i}`} className="section project">
          <div className={`panel ${i % 2 === 0 ? 'left' : 'right'}`}>
            <p className="count">{i + 1} of {projects.length}</p>
            <h3 className="project-title">{p.title}</h3>
            <p>{p.summary}</p>
            <p className="stack"><span>Built with</span> {p.stack.join(', ')}</p>
            <div className="links">
              <a href={p.code} target="_blank" rel="noreferrer">View code on GitHub</a>
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer">Open live site</a>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function Journey() {
  return (
    <section id="experience" data-stop="journey" className="section tall">
      <div className="panel left">
        <h2>Experience and education</h2>
        <ol className="timeline">
          {journey.map((j) => (
            <li key={j.title}>
              <p className="when">{j.when}</p>
              <h3>{j.title}</h3>
              <p className="org">{j.org}</p>
              <ul>
                {j.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Credentials() {
  return (
    <section id="credentials" data-stop="credentials" className="section tall">
      <div className="panel right">
        <h2>Certifications and hackathons</h2>
        <p className="muted">The bright stars are certifications; the fainter ones are 24-hour hackathons.</p>
        <ul className="cert-list">
          {certifications.map((c) => (
            <li key={c.title}>
              <strong>{c.title}</strong>
              <span>{c.issuer}</span>
            </li>
          ))}
        </ul>
        <h3 className="sub">Hackathons</h3>
        <ul className="cert-list compact">
          {hackathons.map((h) => (
            <li key={h.name}>
              <strong>{h.name}</strong>
              <span>{h.focus}</span>
            </li>
          ))}
        </ul>
        <h3 className="sub">Achievements</h3>
        <ul className="plain">
          {achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" data-stop="contact" className="section contact">
      <div className="panel left">
        <h2>Let’s build something together</h2>
        <p className="lead">I’m open to roles and internships in AI, machine learning and full-stack development. The fastest way to reach me is email.</p>
        <a className="email" href={`mailto:${profile.email}`}>{profile.email}</a>
        <ul className="contact-links">
          <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
          <li><a href={profile.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={profile.phoneHref}>{profile.phone}</a></li>
          <li><a href={profile.resume} download>Resume (PDF)</a></li>
        </ul>
        <footer className="foot">
          <p>© {new Date().getFullYear()} {profile.name}. {profile.location}.</p>
          <p>Built with React, Three.js and React Three Fiber. Every world here is generated in code.</p>
        </footer>
      </div>
    </section>
  );
}
