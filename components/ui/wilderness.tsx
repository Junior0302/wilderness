import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.ts';
import ProjectsSection from './projects.tsx';

export interface ParallaxLayer {
  src: string;
  alt: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  distance: number;
  className?: string;
  zIndex: number;
  initialTop: string;
  initialLeft: string;
  width: string;
}

export interface ParallaxHeroProps {
  layers?: ParallaxLayer[];
  title?: string;
  className?: string;
}

const defaultLayers: ParallaxLayer[] = [
  {
    src: './assets/desert/desert-dusk.png',
    alt: 'red desert dunes at twilight',
    speedX: 0.018,
    speedY: 0.012,
    speedZ: 0,
    rotation: 0,
    distance: -300,
    zIndex: 1,
    initialTop: '50%',
    initialLeft: '50%',
    width: 'max(1700px, 125vw)',
  },
  {
    src: './assets/desert/desert-mesas.png',
    alt: 'red sandstone mesas',
    speedX: 0.07,
    speedY: 0.045,
    speedZ: 0.12,
    rotation: 0.025,
    distance: 1700,
    zIndex: 12,
    initialTop: 'calc(50% + 230px)',
    initialLeft: 'calc(50% + 100px)',
    width: 'min(1536px, 118vw)',
    className: 'desert-mesas',
  },
  {
    src: './assets/desert/desert-cacti.png',
    alt: 'saguaro cactus cluster',
    speedX: 0.115,
    speedY: 0.09,
    speedZ: 0.04,
    rotation: 0.03,
    distance: 2450,
    zIndex: 22,
    initialTop: 'calc(50% + 170px)',
    initialLeft: 'calc(50% - 520px)',
    width: 'min(690px, 58vw)',
    className: 'desert-cacti desert-cacti-main',
  },
  {
    src: './assets/desert/desert-cacti.png',
    alt: 'distant cactus silhouette',
    speedX: 0.05,
    speedY: 0.03,
    speedZ: 0.02,
    rotation: 0.01,
    distance: 2850,
    zIndex: 15,
    initialTop: 'calc(50% + 235px)',
    initialLeft: 'calc(50% + 600px)',
    width: '420px',
    className: 'desert-distance desert-cacti',
  },
  {
    src: './assets/desert/desert-foreground.png',
    alt: 'wind-carved foreground dune with desert plants',
    speedX: 0.14,
    speedY: 0.11,
    speedZ: 0.08,
    rotation: 0.035,
    distance: 3600,
    zIndex: 45,
    initialTop: 'calc(100% - 190px)',
    initialLeft: '50%',
    width: 'max(1700px, 125vw)',
    className: 'desert-foreground',
  },
];

const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  layers = defaultLayers,
  title = 'DUNES',
  className,
}) => {
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLSpanElement>(null);
  const cursorDotRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1350);
    return () => window.clearTimeout(timer);
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
    let cursorFrame: number | null = null;

    const animateRing = () => {
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
      cursorFrame = window.requestAnimationFrame(animateRing);
    };

    const handleCursorMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty('--cursor-x', `${event.clientX}px`);
      root.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      body.classList.toggle('cursor-hover', Boolean(target?.closest('a, button, [data-cursor]')));
    };
    const handlePointerOut = (event: PointerEvent) => {
      const target = event.relatedTarget as Element | null;
      body.classList.toggle('cursor-hover', Boolean(target?.closest('a, button, [data-cursor]')));
    };

    body.classList.add('cursor-enabled');
    root.style.setProperty('--cursor-x', `${targetX}px`);
    root.style.setProperty('--cursor-y', `${targetY}px`);
    cursorFrame = window.requestAnimationFrame(animateRing);
    window.addEventListener('pointermove', handleCursorMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    return () => {
      body.classList.remove('cursor-enabled', 'cursor-hover');
      window.removeEventListener('pointermove', handleCursorMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      if (cursorFrame !== null) window.cancelAnimationFrame(cursorFrame);
    };
  }, []);

  useEffect(() => {
    const horizontalTrack = document.querySelector<HTMLElement>('.horizontal-track');
    if (!horizontalTrack) return undefined;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = horizontalTrack.scrollLeft;
      horizontalTrack.classList.add('is-dragging');
      event.preventDefault();
      horizontalTrack.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      horizontalTrack.scrollLeft = startScroll - (event.clientX - startX);
    };
    const stopDragging = (event?: PointerEvent) => {
      dragging = false;
      horizontalTrack.classList.remove('is-dragging');
      if (event && horizontalTrack.hasPointerCapture(event.pointerId)) horizontalTrack.releasePointerCapture(event.pointerId);
    };

    horizontalTrack.addEventListener('pointerdown', handlePointerDown);
    horizontalTrack.addEventListener('pointermove', handlePointerMove);
    horizontalTrack.addEventListener('pointerup', stopDragging);
    horizontalTrack.addEventListener('pointercancel', stopDragging);
    return () => {
      horizontalTrack.removeEventListener('pointerdown', handlePointerDown);
      horizontalTrack.removeEventListener('pointermove', handlePointerMove);
      horizontalTrack.removeEventListener('pointerup', stopDragging);
      horizontalTrack.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const resetTransforms = () => {
      layerRefs.current.forEach((element) => {
        if (element) element.style.transform = 'translate(-50%, -50%)';
      });
      if (textRef.current) textRef.current.style.transform = 'translate(-50%, -50%)';
    };

    const updateScene = () => {
      frameRef.current = null;
      if (!motionEnabled) {
        resetTransforms();
        return;
      }

      const { x, y } = pointerRef.current;
      const xValue = x - window.innerWidth / 2;
      const yValue = y - window.innerHeight / 2;
      const rotateDegree = (xValue / (window.innerWidth / 2 || 1)) * 14;

      layerRefs.current.forEach((element, index) => {
        if (!element) return;
        const layer = layers[index];
        if (!layer) return;
        const computedLeft = element.offsetLeft || window.innerWidth / 2;
        const side = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (x - computedLeft) * side * 0.1;
        element.style.transform = `perspective(2300px) translateZ(${zValue * layer.speedZ}px) rotateY(${rotateDegree * layer.rotation}deg) translateX(calc(-50% + ${-xValue * layer.speedX}px)) translateY(calc(-50% + ${yValue * layer.speedY}px))`;
      });

      if (textRef.current) {
        textRef.current.style.transform = `perspective(2300px) translateZ(10px) rotateY(${rotateDegree * 0.035}deg) translateX(calc(-50% + ${-xValue * 0.035}px)) translateY(calc(-50% + ${yValue * 0.025}px))`;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(updateScene);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailsOpen(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    resetTransforms();
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [layers, motionEnabled]);

  const jumpToView = () => {
    setDetailsOpen(true);
  };

  const scrollToHorizon = () => {
    const root = document.getElementById('root');
    const horizon = document.getElementById('horizon');
    if (!root || !horizon) return;
    root.scrollTo({ top: horizon.offsetTop, behavior: 'smooth' });
  };

  return (
    <div className="dunes-page" aria-busy={isLoading}>
      <div className={cn('loading-screen', !isLoading && 'is-loaded')} aria-hidden={!isLoading}>
        <div className="loading-inner">
          <p className="loading-kicker">MOJAVE / FIELD STUDY 001</p>
          <p className="loading-word">DUNES</p>
          <div className="loading-progress"><span /></div>
          <p className="loading-status">Calibrating the horizon</p>
        </div>
      </div>

      <div className="custom-cursor" aria-hidden="true">
        <span className="cursor-ring" />
        <span ref={cursorDotRef} className="cursor-dot" />
      </div>

      <main
        aria-label={`${title} wilderness parallax scene`}
        className={cn('wilderness-hero', className)}
      >
      <svg className="filter-definitions" aria-hidden="true" focusable="false">
        <defs>
          <filter id="mountain-alpha" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncA type="gamma" amplitude="1" exponent="0.1" offset="0" />
            </feComponentTransfer>
          </filter>
          <filter id="cactus-alpha" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncA type="gamma" amplitude="1" exponent="0.16" offset="0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="scene-glow" aria-hidden="true" />
      <div className="cactus-separation cactus-separation-main" aria-hidden="true" />
      <div className="cactus-separation cactus-separation-distance" aria-hidden="true" />

      {layers.map((layer, index) => (
        <img
          key={`${layer.alt}-${index}`}
          ref={(element) => {
            layerRefs.current[index] = element;
          }}
          src={layer.src}
          alt={layer.alt}
          className={cn('wilderness-layer', layer.className)}
          style={{
            width: layer.width,
            top: layer.initialTop,
            left: layer.initialLeft,
            zIndex: layer.zIndex,
            transform: 'translate(-50%, -50%)',
          }}
          draggable={false}
        />
      ))}

      <div className="wilderness-vignette" aria-hidden="true" />

        <header className="site-header">
        <a className="brand" href="." aria-label="Dunes, home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>DUNES</span>
        </a>
        <div className="header-meta" aria-label="Current location">
          <span className="live-dot" aria-hidden="true" />
          <span>MOJAVE / 35.0° N</span>
        </div>
        <div className="header-tools">
          <button className="header-action" type="button" onClick={() => setDetailsOpen(true)}>
            <span>About the scene</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </button>
          <button className={cn('menu-toggle', menuOpen && 'is-open')} type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((value) => !value)} data-cursor="view">
            <span className="menu-toggle-label">Menu</span>
            <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>

      <div ref={textRef} className="wilderness-title">
        <p className="eyebrow">A study in light &amp; distance</p>
        <h1>{title}</h1>
      </div>

      <section className="scene-intro" aria-label="Scene introduction">
        <p className="intro-index">01 <span /> 04</p>
        <p className="intro-copy">Where the horizon<br />keeps moving.</p>
        <button className="primary-action" type="button" onClick={jumpToView}>
          <span>Explore the landscape</span>
          <span className="action-icon" aria-hidden="true">↗</span>
        </button>
      </section>

      <div className="scene-footer">
        <button className="scroll-cue" type="button" onClick={scrollToHorizon} data-cursor="view">
          <span className="scroll-line" /> <span>Scroll to wander</span>
        </button>
        <div className="footer-controls">
          <button
            className={cn('motion-control', motionEnabled && 'is-active')}
            type="button"
            aria-pressed={motionEnabled}
            onClick={() => setMotionEnabled((value) => !value)}
          >
            <span className="control-orb" aria-hidden="true" />
            Motion {motionEnabled ? 'on' : 'off'}
          </button>
          <span className="footer-label">DUNES / 2026</span>
        </div>
      </div>

      {detailsOpen && (
        <div className="details-layer" role="dialog" aria-modal="true" aria-labelledby="details-title">
          <button className="details-backdrop" type="button" aria-label="Close details" onClick={() => setDetailsOpen(false)} />
          <aside className="details-panel">
            <button className="close-button" type="button" aria-label="Close details" onClick={() => setDetailsOpen(false)}>×</button>
            <p className="eyebrow">Field note / 001</p>
            <h2 id="details-title">The desert<br />is never still.</h2>
            <p>Light moves across the mesas, the air shifts, and the horizon redraws itself. Move your pointer to follow the scene.</p>
            <div className="detail-rule" />
            <div className="detail-meta"><span>Coordinates</span><strong>35° 0′ 15″ N</strong></div>
            <div className="detail-meta"><span>Time</span><strong>Golden hour</strong></div>
          </aside>
        </div>
      )}
      </main>

      <section id="horizon" className="scroll-section horizon-section">
        <div className="section-grid">
          <div className="section-copy reveal-on-scroll">
            <p className="section-kicker">02 / 04 &nbsp;—&nbsp; The horizon</p>
            <h2 className="section-title line-reveal"><span>Distance</span><span>has a color.</span></h2>
            <p className="section-body">At the edge of the day, every mesa becomes a measure of light. The desert does not stand still — it slowly changes its mind.</p>
            <div className="section-rule"><span /></div>
            <p className="section-note">A field study in warm shadows<br />and long horizons.</p>
          </div>
          <div className="section-art reveal-on-scroll">
            <div className="art-frame mesa-frame">
              <img src="./assets/desert/desert-mesas.png" alt="Layered red sandstone mesas" draggable={false} />
              <span className="art-coordinate">35° 00′ 15″ N</span>
              <span className="art-scanline" />
            </div>
            <p className="art-caption"><span>01</span> / sandstone study</p>
          </div>
        </div>
      </section>

      <section className="scroll-section field-section">
        <div className="field-backdrop" aria-hidden="true" />
        <div className="field-content">
          <p className="section-kicker reveal-on-scroll">03 / 04 &nbsp;—&nbsp; Field notes</p>
          <h2 className="section-title section-title-wide line-reveal reveal-on-scroll"><span>Nothing here</span><span>is truly still.</span></h2>
          <p className="section-body field-body reveal-on-scroll">Wind redraws the dunes. Heat softens the distance. One slow breath and the whole landscape moves with you.</p>
          <div className="field-image reveal-on-scroll">
            <img src="./assets/desert/desert-dusk.png" alt="Desert valley at blue hour" draggable={false} />
            <span className="field-image-label">OBSERVATION / 18:42</span>
          </div>
        </div>
      </section>

      <ProjectsSection />

      <section className="scroll-section closing-section">
        <div className="closing-orbit" aria-hidden="true" />
        <div className="closing-content reveal-on-scroll">
          <p className="section-kicker">05 / 05 &nbsp;—&nbsp; Afterglow</p>
          <h2 className="section-title line-reveal"><span>Stay with</span><span>the light.</span></h2>
          <p className="section-body">The last color leaves slowly. Keep wandering until the horizon becomes a memory.</p>
          <button className="primary-action closing-action" type="button" onClick={() => document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' })} data-cursor="view">
            <span>Return to the horizon</span>
            <span className="action-icon" aria-hidden="true">↑</span>
          </button>
          <p className="closing-mark">DUNES / MOJAVE / 2026</p>
        </div>
      </section>

      <nav id="site-menu" className={cn('menu-overlay', menuOpen && 'is-open')} aria-label="Main navigation" aria-hidden={!menuOpen}>
        <div className="menu-wash" aria-hidden="true" />
        <div className="menu-content">
          <div className="menu-topline"><span>Navigate the field</span><span>DUNES / 2026</span></div>
          <div className="menu-links">
            <a href="./index.html#horizon" onClick={() => setMenuOpen(false)}><span>01</span><strong>Horizon</strong><em>↗</em></a>
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

export const ParallaxHeroDemo = () => <ParallaxHero />;

export default ParallaxHero;
