"""Builds the four project pages in work/ from the data below.

Run from the repo root:  python tools/build_work.py   (needs Pillow)
Edit the copy here, not in the generated HTML, or the next build will overwrite it.

Each page is a trailer, not a case study: title, detail boxes, cover, a short
description, the prototype video, the remaining snippets, then the hand-off to Behance.
The snippets are the frames in the Figma section "Claude · Project trailer snippets"
(file uG8MdK8svbC6sa0wQ5kyIK, node 2298:739), exported at 2880px wide to
work/img/<slug>/NN.webp. 01 is always the cover. Keep every deck's own style.
"""
import html
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEHANCE = 'https://www.behance.net/rutujeetnayak'
LINKEDIN = 'https://www.linkedin.com/in/rutujeet-nayak-b5a47129b'

PROJECTS = [
  dict(
    slug='uls', film='ULS teaser film', title='ULS', short='ULS',
    meta=[('Course', 'Service design'),
          ('My role', 'Research &amp; Analysis, Design Direction, Models and Blueprints'),
          ('Methods', 'Field interviews, systems mapping, service blueprint'),
          ('Year', '2026')],
    about='Every morning, daily wage workers gather at urban nakas and contractors pick them by appearance, '
          'familiarity or build. Skills cannot be proved and wages are paid in cash with no record. ULS, the '
          'Urban Labour System, is a coordinator-led service built from field research at nakas in Pune: a '
          'QR-linked worker ID, demand-based allocation, and tools for workers, foremen and contractors that '
          'record every wage and attendance mark.',
    behance=None,
    alts=['ULS billboard reading Designed for Real Work, Not Office Work',
          'The new ULS service blueprint from pre-job to project end',
          'Foreman console screens designed in Hindi first',
          'Contractor dashboard for selecting workers by skill, reliability and wage']),
  dict(
    slug='relique', film='Walkthrough of the Relique website prototype', title='RELIQUE', short='Relique',
    meta=[('Course', 'Semiotics and semantics'),
          ('My role', 'Design Direction, Research, Image and Story Generation'),
          ('Tools', 'Figma, FigJam'),
          ('Year', '2025')],
    about='Relique is a museum website where artifacts tell their own stories, in the first person. Rooted in '
          'semiotics and semantics, it turns static collections into something you can wander: find a museum on '
          'the map, open its collection, and let an object\'s My Story play out in sound and image.',
    behance='https://www.behance.net/gallery/241042181/Storytelling-Museum-Website',
    alts=['Relique title over a dark still life painting',
          'Relique home page on desktop and mobile',
          'My Story view, where an artifact narrates its own history',
          'Printed museum tickets and the Relique card']),
  dict(
    slug='iccc-surveillance', film='Walkthrough of the working ICCC dashboard prototype', title='ICCC SURVEILLANCE', short='ICCC Surveillance',
    meta=[('Course', 'Object-oriented UX'),
          ('My role', 'High Fidelity UI, Research &amp; Analysis, OOUX Calculations, Diagramming'),
          ('Methods', 'Field observation, interviews, task modelling'),
          ('Year', '2026')],
    about='The Integrated Command and Control Centre in Taloja MIDC watches 310 cameras, 349 street lights and '
          'over 1,000 smart poles across 950+ industries. In the command centre we saw operators verify every '
          'alert by hand and dispatch field teams over WhatsApp. Using object-oriented UX we cut the system\'s '
          'object model to 6.2% of its original cognitive load, then redesigned the dashboard around how alerts '
          'are actually verified, escalated and resolved.',
    behance=None,
    alts=['ICCC Surveillance cover',
          'Live map dashboard with device clusters and filters',
          'Device cards with status, event logs and one-click acknowledge',
          'Alert summary dashboard with pinned counts across domains']),
  dict(
    slug='canva-ai', film='Walkthrough of the redesigned Canva AI prototype', title='CANVA AI REDESIGN', short='Canva AI redesign',
    meta=[('Type', 'UI/UX, conversational AI'),
          ('My role', 'Visual Design, Research &amp; Analysis, AI Response Analysis, Framework Design'),
          ('Methods', 'Prompt testing, review analysis'),
          ('Year', '2025')],
    about='Canva\'s AI assistant serves 180 million monthly users, most of them non-designers. We tested it with '
          'a bank of 50 real-world prompts, built the CAPABLE framework to pin down where it misread intent, and '
          'redesigned the assistant to stay inside the file, ask before it changes anything, and review a design '
          'the way a consultant would.',
    behance='https://www.behance.net/gallery/241041049/Redesign-of-Canvas-AI-Model',
    alts=['Canva AI project cover',
          'The CAPABLE framework: seven lenses for judging a design AI',
          'Redesigned Canva AI acting as a design consultant on a poster',
          'Redesigned Canva AI handling a compound command in the editor']),
]

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · Rutujeet</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@700&family=Abril+Fatface&family=Bebas+Neue&family=Courier+Prime:wght@700&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../lab.css">
<link rel="stylesheet" href="work.css">
</head>
<body>

<svg class="grain" aria-hidden="true"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>
<div class="cursor" id="cursor"><span class="dot"></span><span class="tag"></span></div>

<div class="navwrap"><nav class="nav">
  <a href="../index.html" class="logo" data-cursor="Home" aria-label="Rutujeet, home"><span class="l1">R</span><span class="l2">T</span><span class="l3">/</span><span class="l4">J</span><span class="l5">T</span></a>
  <span class="grow"></span>
  <a href="../index.html#work" class="lnk on">Work</a>
  <a href="../about.html" class="lnk">About</a>
  <a href="#" class="lnk">Resume</a>
  <a href="#contact" class="lnk cta">Get in touch</a>
</nav></div>
'''

FOOT = '''
<footer class="foot" id="contact">
  <h2>SAY <span class="hl">HI</span></h2>
  <button type="button" class="mailbtn" id="mail" data-cursor="Copy?"
          data-mail="rutujeetnayak@gmail.com" aria-label="Copy email address">
    <span class="addr">rutujeetnayak@gmail.com</span>
    <span class="stamp" role="status"></span>
  </button>
  <nav class="foot-links">
    <a href="{behance}" target="_blank" rel="noopener">Behance <span aria-hidden="true">&#8599;</span></a>
    <a href="{linkedin}" target="_blank" rel="noopener">LinkedIn <span aria-hidden="true">&#8599;</span></a>
  </nav>
  <div class="foot-base">
    <span>© 2026 Rutujeet</span>
    <button type="button" class="totop">Back to top <span aria-hidden="true">&#8593;</span></button>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js" integrity="sha512-oJ8QbaQThQoJZ7oEv+29jfPM6CcP+zUxh3PKJs1vyOhx0UraUrE7PQgeItu3dOuCJyrzWpoYMsVjkkPEBzbUqw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>gsap.registerPlugin(ScrollTrigger);</script>
<script src="../lab.js"></script>
<script src="work.js"></script>
</body>
</html>
'''.format(behance=BEHANCE, linkedin=LINKEDIN)


def shots(slug):
    folder = os.path.join(ROOT, 'work', 'img', slug)
    return sorted(f[:-5] for f in os.listdir(folder) if f.endswith('.webp'))


def img(slug, name, alt, eager=False):
    w, h = Image.open(os.path.join(ROOT, 'work', 'img', slug, name + '.webp')).size
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<img src="img/{slug}/{name}.webp" width="{w}" height="{h}" '
            f'alt="{html.escape(alt)}" loading="{load}" decoding="async">')


def film(p):
    """The prototype recording: muted, looping, no controls; work.js plays it while it is on screen.
    Encoded to work/vid/<slug>.mp4 (H.264, 1600px, no audio) with a poster frame beside it."""
    slug = p['slug']
    if not os.path.exists(os.path.join(ROOT, 'work', 'vid', slug + '.mp4')):
        return ''
    w, h = Image.open(os.path.join(ROOT, 'work', 'vid', slug + '.webp')).size
    return (f'<section class="film"><div class="frame" data-reveal>'
            f'<video src="vid/{slug}.mp4" poster="vid/{slug}.webp" width="{w}" height="{h}" '
            f'muted loop playsinline preload="none" aria-label="{html.escape(p["film"])}"></video>'
            f'</div></section>\n')


def page(p, nxt):
    names = shots(p['slug'])
    alts = p['alts'] + [''] * len(names)
    on_profile = p['behance'] is None
    link = p['behance'] or BEHANCE
    meta = ''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k, v in p['meta'])
    rest = ''.join(f'\n  <div class="frame" data-reveal>{img(p["slug"], n, alts[i + 1])}</div>' for i, n in enumerate(names[1:]))
    out = HEAD.format(title=p['short'], desc=html.escape(p['about'][:155]))
    out += f'''
<header class="chead">
  <h1>{p['title']}</h1>
  <div class="meta">{meta}</div>
</header>

<div class="cover"><div class="frame">{img(p['slug'], names[0], alts[0], eager=True)}</div></div>

<section class="about">
  <p>{p['about']}</p>
</section>

{film(p)}
<section class="shots">{rest}
</section>

<section class="sec end">
  <a class="bh" href="{link}" target="_blank" rel="noopener" data-cursor="Behance" data-reveal>
    <div>
      <h2>VIEW ON BEHANCE</h2>
      <p>{'The full case study, with every step of the process.' if not on_profile else 'The full case study is on its way. The rest of the work is already there.'}</p>
    </div>
    <span class="rbtn" aria-hidden="true">&#8599;</span>
  </a>
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><span class="lab">Next project</span><h3>{nxt['short']}</h3></div>
    <span class="rbtn" aria-hidden="true">&rarr;</span>
  </a>
</section>
'''
    return out + FOOT


if __name__ == '__main__':
    for i, p in enumerate(PROJECTS):
        dest = os.path.join(ROOT, 'work', p['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8', newline='\n') as f:
            f.write(page(p, PROJECTS[(i + 1) % len(PROJECTS)]))
        print('wrote', os.path.relpath(dest, ROOT))
