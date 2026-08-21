import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.ts';

export type EditorialKind = 'journal' | 'atlas' | 'archive';

const pageData: Record<EditorialKind, {
  kicker: string;
  title: [string, string];
  intro: string;
  image: string;
  imageAlt: string;
  label: string;
  entries: Array<{ index: string; title: string; text: string }>;
}> = {
  journal: {
    kicker: 'Field notes / 002',
    title: ['The quiet', 'between things.'],
    intro: 'A collection of observations from the edge of the day — where heat, wind and distance leave their mark.',
    image: './assets/desert/desert-cacti.png',
    imageAlt: 'Saguaro cactus cluster in warm light',
    label: 'Specimen / Saguaro no. 07',
    entries: [
      { index: '08:14', title: 'The first shadow', text: 'Before the heat arrives, the rocks hold the cool blue of the night.' },
      { index: '12:26', title: 'Air becomes visible', text: 'A shimmer lifts from the valley and the distance starts to breathe.' },
      { index: '18:42', title: 'Last light', text: 'The longest shadows belong to the quietest hour.' },
    ],
  },
  atlas: {
    kicker: 'Coordinates / 003',
    title: ['A map of', 'warm distance.'],
    intro: 'Follow the color shift from blue hour to ember. The landscape changes long before the night arrives.',
    image: './assets/desert/desert-mesas.png',
    imageAlt: 'Red sandstone mesas forming a desert map',
    label: 'Mojave / 35° 00′ 15″ N',
    entries: [
      { index: 'A / 01', title: 'North face', text: 'Cool stone, hard edges, a horizon held at arm’s length.' },
      { index: 'B / 02', title: 'Red basin', text: 'A low passage where the last orange light gathers.' },
      { index: 'C / 03', title: 'Wind line', text: 'The route changes every evening, drawn again by the dunes.' },
    ],
  },
  archive: {
    kicker: 'Archive / 004',
    title: ['Light leaves', 'a record.'],
    intro: 'A small archive of textures, silhouettes and fleeting colors collected across one desert evening.',
    image: './assets/desert/desert-foreground.png',
    imageAlt: 'Wind-carved foreground dune at dusk',
    label: 'Afterglow / Frame 24',
    entries: [
      { index: 'TAPE 01', title: 'Dust / low sun', text: 'A thin veil turns the road into a soft line through the valley.' },
      { index: 'TAPE 02', title: 'Cinder sky', text: 'The blue goes deep. The red stays low against the ground.' },
      { index: 'TAPE 03', title: 'No signal', text: 'When the horizon disappears, the body starts to navigate by feeling.' },
    ],
  },
};

const EditorialPage: React.FC<{ kind: EditorialKind }> = ({ kind }) => {
  const data = pageData[kind];
  const cursorRingRef = useRef<HTMLSpanElement>(null);
  const cursorDotRef = useRef<HTMLSpanElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const finePointer = window.matchMedia('(pointer: fine)').matches || window.matchMedia('(hover: hover)').matches;
    const desktopPointer = navigator.maxTouchPoints === 0 || finePointer;
    if (!desktopPointer) return undefined;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame: number | null = null;
    const animate = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = `${currentX}px`;
        cursorRingRef.current.style.top = `${currentY}px`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${currentX}px`;
        cursorDotRef.current.style.top = `${currentY}px`;
      }
      frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty('--cursor-x', `${event.clientX}px`);
      root.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    const over = (event: PointerEvent) => {
      const target = event.target as Element | null;
      body.classList.toggle('cursor-hover', Boolean(target?.closest('a, button, [data-cursor]')));
    };
    const out = (event: PointerEvent) => {
      const target = event.relatedTarget as Element | null;
      body.classList.toggle('cursor-hover', Boolean(target?.closest('a, button, [data-cursor]')));
    };
    body.classList.add('cursor-enabled');
    root.style.setProperty('--cursor-x', `${targetX}px`);
    root.style.setProperty('--cursor-y', `${targetY}px`);
    frame = requestAnimationFrame(animate);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerout', out, { passive: true });
    return () => {
      body.classList.remove('cursor-enabled', 'cursor-hover');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerout', out);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={cn('dunes-page', 'editorial-page', `editorial-${kind}`)}>
      <div className="custom-cursor" aria-hidden="true"><span ref={cursorRingRef} className="cursor-ring" /><span ref={cursorDotRef} className="cursor-dot" /></div>
      <header className="editorial-header">
        <a className="brand" href="./index.html" aria-label="Dunes, home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>DUNES</span></a>
        <span className="editorial-location">{data.kicker}</span>
        <button className={cn('menu-toggle', menuOpen && 'is-open')} type="button" aria-expanded={menuOpen} aria-controls="editorial-menu" onClick={() => setMenuOpen((value) => !value)} data-cursor="view">
          <span className="menu-toggle-label">Menu</span><span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
      </header>

      <main>
        <section className="editorial-hero">
          <div className="editorial-hero-copy reveal-on-scroll">
            <p className="section-kicker">{data.kicker}</p>
            <h1 className="editorial-title line-reveal"><span>{data.title[0]}</span><span>{data.title[1]}</span></h1>
            <p className="editorial-intro">{data.intro}</p>
            <span className="editorial-scroll-mark">Scroll to read <i>↓</i></span>
          </div>
          <div className="editorial-hero-image reveal-on-scroll">
            <img src={data.image} alt={data.imageAlt} draggable={false} />
            <span className="editorial-image-label">{data.label}</span>
          </div>
        </section>

        <section className="editorial-entries">
          <div className="editorial-entry-head reveal-on-scroll"><span>Index</span><span>Notes from the field</span><span>01 — 03</span></div>
          {data.entries.map((entry, index) => (
            <article className="editorial-entry reveal-on-scroll" key={entry.index}>
              <span className="editorial-entry-index">{entry.index}</span>
              <h2>{entry.title}</h2>
              <p>{entry.text}</p>
              <span className="editorial-entry-arrow">↗</span>
            </article>
          ))}
        </section>

        <section className="editorial-end reveal-on-scroll">
          <p className="section-kicker">One more thing</p>
          <p className="editorial-end-quote">“The desert keeps its own time.”</p>
          <a className="primary-action" href="./index.html" data-cursor="view"><span>Back to Dunes</span><span className="action-icon" aria-hidden="true">↗</span></a>
        </section>
      </main>

      <nav id="editorial-menu" className={cn('menu-overlay', menuOpen && 'is-open')} aria-label="Main navigation" aria-hidden={!menuOpen}>
        <div className="menu-wash" aria-hidden="true" />
        <div className="menu-content">
          <div className="menu-topline"><span>Navigate the field</span><span>DUNES / 2026</span></div>
          <div className="menu-links">
            <a href="./index.html"><span>01</span><strong>Horizon</strong><em>↗</em></a>
            <a href="./journal.html"><span>02</span><strong>Journal</strong><em>↗</em></a>
            <a href="./atlas.html"><span>03</span><strong>Atlas</strong><em>↗</em></a>
            <a href="./archive.html"><span>04</span><strong>Archive</strong><em>↗</em></a>
          </div>
          <p className="menu-footer">Move slowly. Look longer.</p>
        </div>
      </nav>
    </div>
  );
};

export default EditorialPage;
