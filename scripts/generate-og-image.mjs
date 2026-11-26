import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getLiveDownloadTotal } from './lib/gemStats.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const GOLD = '#E2C799';
const BORDER_GOLD = 'rgba(226,199,153,0.25)';

function h(type, props = {}, ...children) {
  children = children.flat(Infinity).filter(c => c !== null && c !== undefined && c !== false);
  return { type, props: { ...props, children: children.length <= 1 ? children[0] : children } };
}

function dot() {
  return h('div', { style: { display: 'flex', width: 6, height: 6, borderRadius: 999, background: GOLD, flexShrink: 0 } });
}

function statItem(text) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter', fontWeight: 600, fontSize: 19, color: '#C8C8C8' } },
    dot(),
    text
  );
}

async function main() {
  const { total, isLive } = await getLiveDownloadTotal();
  const displayDownloads = `${total.toLocaleString()}+`;

  const photoSrc = `data:image/svg+xml;base64,${fs.readFileSync(path.join(root, 'public', 'syed_ghani.svg')).toString('base64')}`;

  const [spaceGroteskBold, interRegular, interSemiBold] = [
    'SpaceGrotesk-Bold.woff',
    'Inter-Regular.woff',
    'Inter-SemiBold.woff',
  ].map(f => fs.readFileSync(path.join(__dirname, 'fonts', f)));

  const element = h(
    'div',
    {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(155deg, #171717 0%, #121212 45%, #0E0E0E 100%)',
        padding: '64px 72px',
        position: 'relative',
        fontFamily: 'Inter',
      },
    },
    h('div', {
      style: {
        display: 'flex',
        position: 'absolute',
        top: -140,
        right: -100,
        width: 560,
        height: 560,
        borderRadius: 999,
        background: 'radial-gradient(circle, rgba(226,199,153,0.16) 0%, rgba(226,199,153,0) 70%)',
      },
    }),

    h(
      'div',
      { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 } },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', maxWidth: 700 } },
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 60, color: '#FFFFFF', lineHeight: 1.08, marginBottom: 16 } },
          'Syed M. Ghani'
        ),
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 30, color: GOLD, marginBottom: 18 } },
          'Ruby on Rails & React Engineer'
        ),
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Inter', fontWeight: 400, fontSize: 21, color: '#9A9A9A' } },
          'Lahore & Remote · GMT+5'
        )
      ),
      h('img', {
        src: photoSrc,
        width: 240,
        height: 240,
        style: { borderRadius: 999, border: `5px solid ${GOLD}`, objectFit: 'cover' },
      })
    ),

    h(
      'div',
      { style: { display: 'flex', borderTop: `1px solid ${BORDER_GOLD}`, paddingTop: 28, alignItems: 'center', gap: 28 } },
      statItem('6 SaaS Products'),
      statItem('4 Rails Gems'),
      statItem(`${displayDownloads} Gem Downloads${isLive ? ' (live)' : ''}`)
    )
  );

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Space Grotesk', data: spaceGroteskBold, weight: 700, style: 'normal' },
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  fs.writeFileSync(path.join(root, 'public', 'og-image.png'), png);

  console.log(`og-image.png generated — ${displayDownloads} downloads (${isLive ? 'live' : 'fallback'})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
