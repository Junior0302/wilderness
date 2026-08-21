import React, { useEffect, useRef } from 'react';

type Project = {
  number: string;
  name: string;
  category: string;
  description: string;
  image: string;
  className: string;
};

const projects: Project[] = [
  {
    number: '01 / 05',
    name: 'Aster House',
    category: 'WEB DESIGN',
    description: 'A quiet digital home for architecture, material and light.',
    image: './assets/desert/desert-dusk.png',
    className: 'project-card--wide',
  },
  {
    number: '02 / 05',
    name: 'Morrow',
    category: '3D / EXPERIENCE',
    description: 'A tactile product universe built for the next morning.',
    image: './assets/desert/desert-mesas.png',
    className: 'project-card--tall',
  },
  {
    number: '03 / 05',
    name: 'NØRD / 09',
    category: 'BRANDING',
    description: 'A precise identity system for a new kind of object.',
    image: './assets/desert/desert-cacti.png',
    className: 'project-card--offset',
  },
  {
    number: '04 / 05',
    name: 'Serein',
    category: 'DIGITAL',
    description: 'A calm interface for people working at full attention.',
    image: './assets/desert/desert-foreground.png',
    className: 'project-card--low',
  },
  {
    number: '05 / 05',
    name: 'Solace',
    category: 'CREATIVE DEVELOPMENT',
    description: 'An atmospheric launch experience with room to breathe.',
    image: './assets/desert/desert-dusk.png',
    className: 'project-card--final',
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ProjectsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const root = document.getElementById('root');
    const section = sectionRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    const current = currentRef.current;
    const gsap = (window as Window & { gsap?: any }).gsap;
    const ScrollTrigger = (window as Window & { ScrollTrigger?: any }).ScrollTrigger;

    if (window.matchMedia('(max-width: 700px)').matches || !root || !section || !track || !gsap || !ScrollTrigger) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    let activeIndex = -1;

    const updateCards = (progressValue: number) => {
      const distance = Math.max(0, track.scrollWidth - section.clientWidth);
      const boundedProgress = clamp(progressValue, 0, 1);
      const translateX = -clamp(distance * boundedProgress, 0, distance);
      const viewportCenter = section.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2 + translateX;
        const difference = cardCenter - viewportCenter;
        const normalized = clamp(1 - Math.abs(difference) / (section.clientWidth * 0.72), 0, 1);
        const imageShift = clamp(-difference / section.clientWidth * 10, -10, 10);
        card.style.setProperty('--focus', normalized.toFixed(3));
        card.style.setProperty('--image-shift', `${imageShift.toFixed(2)}px`);
        card.style.setProperty('--image-saturation', (0.72 + normalized * 0.18).toFixed(3));
        card.style.setProperty('--image-brightness', (0.64 + normalized * 0.16).toFixed(3));

        if (Math.abs(difference) < nearestDistance) {
          nearestDistance = Math.abs(difference);
          nearestIndex = index;
        }
      });

      if (activeIndex !== nearestIndex) {
        cards[activeIndex]?.classList.remove('is-active');
        cards[nearestIndex]?.classList.add('is-active');
        activeIndex = nearestIndex;
      }

      if (progress) progress.style.transform = `scaleX(${boundedProgress})`;
      if (current) current.textContent = String(nearestIndex + 1).padStart(2, '0');
    };

    const context = gsap.context(() => {
      gsap.set(track, { x: 0, force3D: true });
      updateCards(0);

      gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - section.clientWidth),
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: section,
          scroller: root,
          start: 'top top',
          end: () => `+=${Math.max(1, track.scrollWidth - section.clientWidth)}`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self: { progress: number }) => updateCards(clamp(self.progress, 0, 1)),
          onRefresh: (self: { progress: number }) => updateCards(clamp(self.progress, 0, 1)),
        },
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh, { passive: true });
    return () => {
      window.removeEventListener('resize', refresh);
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="projects-section" aria-labelledby="projects-title">
      <div className="projects-shell">
        <div className="projects-heading">
          <p className="projects-eyebrow">Selected work / 2026</p>
          <h2 id="projects-title">Projets</h2>
          <p className="projects-heading-note">Scroll to move through the collection</p>
        </div>

        <div className="projects-stage">
          <div ref={trackRef} className="projects-track">
            {projects.map((project, index) => (
              <article
                key={project.name}
                ref={(element) => { cardRefs.current[index] = element; }}
                className={`project-card ${project.className}`}
              >
                <div className="project-card__media">
                  <img src={project.image} alt="" draggable={false} />
                  <span className="project-card__wash" aria-hidden="true" />
                </div>
                <div className="project-card__topline">
                  <span>{project.number}</span>
                  <span>{project.category}</span>
                </div>
                <div className="project-card__copy">
                  <p>{project.category}</p>
                  <h3>{project.name}</h3>
                  <span>{project.description}</span>
                </div>
                <span className="project-card__arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>

        <div className="projects-footer" aria-label="Project progress">
          <div className="projects-index"><span ref={currentRef}>01</span><i>/</i><span>05</span></div>
          <div className="projects-progress"><span ref={progressRef} /></div>
          <span className="projects-footer-label">Genesis Connect</span>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
