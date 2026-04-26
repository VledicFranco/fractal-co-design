import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vledicfranco.github.io',
  base: '/fractal-co-design/',
  integrations: [
    starlight({
      title: 'Fractal Co-Design',
      description:
        'A software design methodology combining Fractal Component Architecture (structure) with Extreme Co-Design (process). Port-first. Surface before architecture.',
      favicon: '/favicon.svg',
      social: {
        github: 'https://github.com/VledicFranco/fractal-co-design',
      },
      sidebar: [
        { label: 'Getting Started', slug: 'getting-started' },
        {
          label: 'Canon',
          items: [
            { label: 'Overview', slug: 'canon' },
            {
              label: 'FCA — Fractal Component Architecture',
              items: [
                { label: 'FCA Overview', slug: 'canon/fca' },
                { label: '01 — The Component', slug: 'canon/fca/01-the-component' },
                { label: '02 — The Levels', slug: 'canon/fca/02-the-levels' },
                { label: '03 — Layers and Domains', slug: 'canon/fca/03-layers-and-domains' },
                { label: '04 — Functional Programming', slug: 'canon/fca/04-functional-programming' },
                { label: '05 — Principles', slug: 'canon/fca/05-principles' },
                { label: '06 — Common Patterns', slug: 'canon/fca/06-common-patterns' },
                { label: '07 — Applied Example', slug: 'canon/fca/07-applied-example' },
                {
                  label: 'Advice',
                  items: [
                    { label: '01 — Multiagent Systems', slug: 'canon/fca/advice/01-multiagent-systems' },
                    { label: '02 — Co-Design Dynamics', slug: 'canon/fca/advice/02-co-design-dynamics' },
                    { label: '03 — Recursive Semantic Algorithms', slug: 'canon/fca/advice/03-recursive-semantic-algorithms' },
                  ],
                },
              ],
            },
            {
              label: 'ECD — Extreme Co-Design',
              items: [
                { label: 'ECD Overview', slug: 'canon/ecd' },
                { label: '01 — Extreme Co-Design', slug: 'canon/ecd/01-extreme-co-design' },
                { label: '02 — Software Translation', slug: 'canon/ecd/02-software-translation' },
                { label: '03 — FCA Synthesis', slug: 'canon/ecd/03-fca-synthesis' },
              ],
            },
          ],
        },
        {
          label: 'Skills',
          items: [
            { label: 'Overview', slug: 'skills' },
            { label: 'fca', slug: 'skills/fca' },
            { label: 'fcd-ref', slug: 'skills/fcd-ref' },
            { label: 'fcd-card', slug: 'skills/fcd-card' },
            { label: 'fcd-design', slug: 'skills/fcd-design' },
            { label: 'fcd-plan', slug: 'skills/fcd-plan' },
            { label: 'fcd-surface', slug: 'skills/fcd-surface' },
            { label: 'fcd-commission', slug: 'skills/fcd-commission' },
            { label: 'fcd-debate', slug: 'skills/fcd-debate' },
            { label: 'fcd-review', slug: 'skills/fcd-review' },
          ],
        },
        {
          label: 'Tools',
          items: [
            { label: 'Overview', slug: 'tools' },
            {
              label: 'fca-index',
              items: [
                { label: 'Overview', slug: 'tools/fca-index' },
                { label: 'Getting Started', slug: 'tools/fca-index/getting-started' },
                { label: 'Language Profiles', slug: 'tools/fca-index/language-profiles' },
                { label: 'MCP Tools', slug: 'tools/fca-index/mcp-tools' },
                { label: 'Architecture', slug: 'tools/fca-index/architecture' },
              ],
            },
          ],
        },
      ],
    }),
    react(),
  ],
});
