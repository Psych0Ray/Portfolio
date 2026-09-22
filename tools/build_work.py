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
    about='ULS, the Urban Labour System, brings a record to informal naka hiring. Built from field research '
          'at nakas in Pune, it gives every daily wage worker a QR-linked ID, matches them to work through a '
          'naka coordinator based on real demand, and logs every wage and attendance mark for workers, '
          'foremen and contractors alike.',
    story=[
      ('The brief',
       'A four-week service design project. We started at the nakas in Pune, where daily wage workers wait each morning for someone to hire them. Contractors pick by looks and by who they recognise. Pay is agreed out loud and handed over in cash. Nothing gets written down anywhere.'),
      ('The aim',
       'We wanted to give this system a record, without forcing anyone to work differently. Three things had to change. A worker should be able to prove what they can do, even to a contractor who has never met them. They should know if there is work before making the trip to the naka. And the wage agreed in the morning should be the wage that gets paid.'),
      ('The outcome',
       'ULS gives every worker an ID card with a QR code on it. Scanning it pulls up their skills, their work history and what they have been paid. Workers without a smartphone are not left out: they can sign up on paper at the naka and get job details by SMS or a voice call. Around the card we designed the rest of the service: an app for workers, a console for foremen in Hindi, and a dashboard for contractors.'),
    ],
    behance='https://www.behance.net/gallery/255996487/ULS-Service-Design',
    # Behance flagged this one as spam; the gallery is a dead end for anyone but the owner,
    # so no secondary link to it from the page.
    hide_behance=True,
    alts=['ULS billboard reading Designed for Real Work, Not Office Work',
          'The new ULS service blueprint from pre-job to project end',
          'ULS analytics dashboard: hiring, wage trends, attendance and site performance',
          'Contractor dashboard for selecting workers by skill, reliability and wage']),
  dict(
    slug='iccc-surveillance', film='Walkthrough of the working ICCC dashboard prototype', title='ICCC SURVEILLANCE', short='ICCC Surveillance',
    meta=[('Course', 'Object-oriented UX'),
          ('My role', 'High-Fidelity UI, Research &amp; Analysis, OOUX Calculations, Diagramming'),
          ('Methods', 'Field observation, interviews, task modelling'),
          ('Year', '2026')],
    about='A redesign of the monitoring dashboard at the Integrated Command and Control Centre in Taloja MIDC, '
          'where a single screen watches an entire industrial estate. Using object-oriented UX, we rebuilt it '
          'around how operators actually verify, escalate and resolve alerts, and cut what they have to keep '
          'in their head by 73.4%.',
    story=[
      ('The brief',
       'The command centre at Taloja MIDC watches one industrial estate: 310 cameras, 349 street lights and over a thousand smart poles, spread across 900 hectares and 950 factories. It all lands on one dashboard, and someone is watching it every hour of the day. Our job was to redesign that dashboard using object-oriented UX.'),
      ('The aim',
       'We wanted the dashboard to fit the operator’s real job, not just to look better. A day in the command centre and interviews with six operators showed us what that job is: checking alerts, sending out field teams and keeping records. All three were happening off the dashboard, by hand, over WhatsApp and in a shared sheet at the end of each shift. The aim was to bring them into one place, and to cut how much an operator has to keep in their head.'),
      ('The outcome',
       'Regrouping the system’s objects and actions cut what an operator has to hold in their head from 408 bits of information down to 109, a drop of 73.4%. The new dashboard is built on that. Alerts cluster on a live map. A device card opens in one click and can be acknowledged from there. Alerts can be cleared in bulk, repeat failures get flagged, and a tickets section replaces the WhatsApp thread.'),
    ],
    behance='https://www.behance.net/gallery/255993261/ICCC-Surveillance-Object-Oriented-UX',
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
    about='A redesign of Canva’s AI assistant for the people who lean on it most: non-designers who can tell '
          'a design looks wrong but not why. We tested it with 50 real-world prompts, named where it misread '
          'intent with the CAPABLE framework, and redesigned it to stay inside the file, ask before it changes '
          'anything, and review a design the way a consultant would.',
    story=[
      ('The brief',
       '180 million people use Canva every month, and most of them are not designers. Its AI assistant has to understand people who cannot say what they want in design words. They can tell the poster looks wrong, but not why. We were asked to test that assistant and then redesign it.'),
      ('The aim',
       'We wanted to find the exact moments the assistant stops understanding a non-designer, and design for those, rather than for a vague sense that it felt bad to use. So we read what people complained about on G2 and Reddit, wrote 50 prompts the way a real Canva user would type them, and ran every one to see where it broke.'),
      ('The outcome',
       'The failures fell into seven patterns, so we made them into a framework called CAPABLE and redesigned the assistant one pattern at a time. It now works inside the file you already have open instead of starting a new one. It asks before it changes anything. When you tell it a design feels flat, it treats that as a problem to diagnose rather than an order to follow. And it can handle a request with two parts in one go.'),
    ],
    behance='https://www.behance.net/gallery/241041049/Redesign-of-Canvas-AI-Model',
    alts=['Canva AI project cover',
          'The CAPABLE framework: seven lenses for judging a design AI',
          'Redesigned Canva AI acting as a design consultant on a poster',
          'Redesigned Canva AI handling a compound command in the editor']),
  dict(
    slug='relique', film='Walkthrough of the Relique website prototype', title='RELIQUE', short='Relique',
    meta=[('Course', 'Semiotics and semantics'),
          ('My role', 'Design Direction, Research, Image and Story Generation'),
          ('Tools', 'Figma, FigJam'),
          ('Year', '2025')],
    about='Relique is a museum website where artifacts tell their own stories, in the first person, and the '
          'design itself does the explaining that a label in a glass case usually does.',
    story=[
      ('The brief',
       'A four-week brief for our semantics and semiotics course: make something where the meaning comes from the design itself, from its shapes and symbols and context, rather than from text explaining it. We chose museums. A museum holds objects with enormous stories behind them, then puts them in a glass case with a name and a date.'),
      ('The aim',
       'We wanted the object to tell you its story, instead of a label summarising it for you. That meant building a site you wander through rather than search, and leaving enough unsaid for the visitor to work out on their own.'),
      ('The outcome',
       'Relique starts on a map. Pick a museum, open its collection, then hover over an object to unlock My Story, where the artifact narrates its own history in its own voice, in sound and images. The symbols do the explaining: a triangle means a story begins here, + and − show what opens and closes, ‹ and › move you through a life. One artifact’s story leads into another’s.'),
    ],
    behance='https://www.behance.net/gallery/241042181/Storytelling-Museum-Website',
    alts=['Relique title over a dark still life painting',
          'Relique home page on desktop and mobile',
          'My Story view, where an artifact narrates its own history',
          'Printed museum tickets and the Relique card']),
]

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · Rutujeet’s Portfolio</title>
<meta name="description" content="{desc}">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="icon" href="../favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Schibsted+Grotesk:wght@400..700&family=JetBrains+Mono:wght@700&family=Abril+Fatface&family=Bebas+Neue&family=Courier+Prime:wght@700&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet">
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
  <a href="#contact" class="lnk">Contact</a>
  <a href="../Rutujeet-Nayak-Resume.pdf" class="lnk cta" target="_blank" rel="noopener" data-cursor="Resume">View Resume <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg></a>
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
    <a href="{behance}" target="_blank" rel="noopener">Behance <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg></a>
    <a href="{linkedin}" target="_blank" rel="noopener">LinkedIn <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg></a>
  </nav>
  <div class="foot-base">
    <span>© 2026 Rutujeet</span>
    <button type="button" class="totop">Back to top <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5v-16M5 11l7-7 7 7"/></svg></button>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js" integrity="sha512-oJ8QbaQThQoJZ7oEv+29jfPM6CcP+zUxh3PKJs1vyOhx0UraUrE7PQgeItu3dOuCJyrzWpoYMsVjkkPEBzbUqw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>gsap.registerPlugin(ScrollTrigger);</script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" integrity="sha384-jqpi9VmOdhyLoLURgjCn7EpnG9BbnHW57ibIZoeaIU+erWDH3k8fQQg0xH2ySjnw" crossorigin="anonymous"></script>
<script src="../lab.js"></script>
<script src="work.js"></script>
</body>
</html>
'''.format(behance=BEHANCE, linkedin=LINKEDIN)


def summary(text, limit=155):
    """The meta description: the lead paragraph, cut at a word boundary rather than mid-word."""
    if len(text) <= limit:
        return text
    return text[:limit - 1].rsplit(' ', 1)[0].rstrip(',;:') + '\u2026'


def shots(slug):
    folder = os.path.join(ROOT, 'work', 'img', slug)
    return sorted(f[:-5] for f in os.listdir(folder) if f.endswith('.webp'))


def img(slug, name, alt, eager=False):
    w, h = Image.open(os.path.join(ROOT, 'work', 'img', slug, name + '.webp')).size
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<img src="img/{slug}/{name}.webp" width="{w}" height="{h}" '
            f'alt="{html.escape(alt)}" loading="{load}" decoding="async">')


def film(p):
    """The prototype recording. Muted, looping, no controls. work.js pins it on scroll, zooms it
    to fill the screen, plays it while it is full screen, then zooms it back out.
    Without JS (or under reduced motion) it is a plain box sized to fit the viewport height.
    Encoded to work/vid/<slug>.mp4 (H.264, 1600px, no audio), plus a VP9 .webm for browsers
    without H.264, and a .webp poster frame."""
    slug = p['slug']
    if not os.path.exists(os.path.join(ROOT, 'work', 'vid', slug + '.mp4')):
        return ''
    w, h = Image.open(os.path.join(ROOT, 'work', 'vid', slug + '.webp')).size
    return (f'<section class="film"><div class="film-stage"><div class="film-box" style="--ar:{w}/{h}">'
            f'<video poster="vid/{slug}.webp" width="{w}" height="{h}" '
            f'muted loop playsinline preload="none" aria-label="{html.escape(p["film"])}">'
            f'<source src="vid/{slug}.mp4" type=\'video/mp4; codecs="avc1.640028"\'>'
            f'<source src="vid/{slug}.webm" type=\'video/webm; codecs="vp9"\'>'
            f'</video>'
            f'</div></div></section>\n')


def story(p):
    """The brief, the aim and the outcome, read off the project's own deck.
    One ink-bordered strip of three panels; the outcome is inverted so the payoff lands
    hardest. Skipped entirely for a project that has no story= yet."""
    rows = p.get('story')
    if not rows:
        return ''
    cells = ''.join(
        f'\n  <div class="sc"><h2>{html.escape(k)}</h2><p>{v}</p></div>'
        for k, v in rows)
    return f'<section class="story" data-reveal>{cells}\n</section>\n'


def full_shots(slug):
    """Images for the on-site case study, work/full/<slug>/NN.jpg, in order."""
    folder = os.path.join(ROOT, 'work', 'full', slug)
    if not os.path.isdir(folder):
        return []
    return sorted(f for f in os.listdir(folder) if f.endswith('.jpg'))


def full_page(p, nxt):
    """The whole deck on one page. Every image is stacked flush against the next with no
    gap at all, inside a single ink frame, so it reads as one continuous scroll. Only the
    first image loads eagerly; the rest arrive as you reach them. Every image carries its
    real width and height so nothing reflows while they load."""
    names = full_shots(p['slug'])
    imgs = ''
    for i, n in enumerate(names):
        w, h = Image.open(os.path.join(ROOT, 'work', 'full', p['slug'], n)).size
        load = 'eager" fetchpriority="high' if i == 0 else 'lazy'
        imgs += (f'\n  <img src="full/{p["slug"]}/{n}" width="{w}" height="{h}" '
                 f'alt="" loading="{load}" decoding="async">')
    out = HEAD.format(title=p['short'] + ' · Full case study',
                      desc=html.escape(summary(p['about'])))
    out += f'''
<header class="fhead">
  <a class="fback" href="{p['slug']}.html" data-cursor="Back">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12h-16M11 5l-7 7 7 7"/></svg>
    Back to {p['short']}
  </a>
  <h1>{p['title']}</h1>
  <p>The full case study, every slide, start to finish.</p>
</header>

<section class="full">{imgs}
</section>

<section class="sec end">
  <a class="next card" href="{p['slug']}.html" data-reveal data-cursor="Back">
    <div><span class="lab">Back to</span><h2>{p['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12h-16M11 5l-7 7 7 7"/></svg></span>
  </a>
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><span class="lab">Next project</span><h2>{nxt['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h16M13 5l7 7-7 7"/></svg></span>
  </a>
</section>
'''
    return out + FOOT


def page(p, nxt):
    names = shots(p['slug'])
    alts = p['alts'] + [''] * len(names)
    has_full = bool(full_shots(p['slug']))
    on_profile = p['behance'] is None
    link = (p['slug'] + '-full.html') if has_full else (p['behance'] or BEHANCE)
    # When the case study lives on the site, Behance drops to a secondary line under it.
    alt = ''
    if has_full and not p.get('hide_behance'):
        alt = ('\n  <a class="bhalt" href="%s" target="_blank" rel="noopener" data-cursor="Behance" data-reveal>'
               '\n    <span>%s</span>'
               '\n    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>'
               '\n  </a>' % (p['behance'] or BEHANCE,
                             'Also on Behance' if not on_profile else 'More work on Behance'))
    meta = ''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k, v in p['meta'])
    rest = ''.join(f'\n  <div class="frame" data-reveal>{img(p["slug"], n, alts[i + 1])}</div>' for i, n in enumerate(names[1:]))
    out = HEAD.format(title=p['short'], desc=html.escape(summary(p['about'])))
    out += f'''
<header class="chead">
  <h1>{p['title']}</h1>
  <div class="meta">{meta}</div>
</header>

<div class="cover"><div class="frame">{img(p['slug'], names[0], alts[0], eager=True)}</div></div>

<section class="about">
  <p>{p['about']}</p>
</section>

{story(p)}{film(p)}
<section class="shots">{rest}
</section>

<section class="sec end">
  <a class="bh" href="{link}"{' target="_blank" rel="noopener"' if not has_full else ''} data-cursor="{'Read' if has_full else 'Behance'}" data-reveal>
    <div>
      <h2>{'VIEW FULL PROJECT' if has_full else 'VIEW ON BEHANCE'}</h2>
      <p>{'Every slide of the case study, on one page.' if has_full else 'The full case study, with every step of the process.' if not on_profile else 'The full case study is on its way. The rest of the work is already there.'}</p>
    </div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="{'M3.5 12h16M13 5l7 7-7 7' if has_full else 'M6 18 18 6M8 6h10v10'}"/></svg></span>
  </a>{alt}
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><span class="lab">Next project</span><h2>{nxt['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h16M13 5l7 7-7 7"/></svg></span>
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
        if full_shots(p['slug']):
            d2 = os.path.join(ROOT, 'work', p['slug'] + '-full.html')
            with open(d2, 'w', encoding='utf-8', newline='\n') as f2:
                f2.write(full_page(p, PROJECTS[(i + 1) % len(PROJECTS)]))
            print('wrote', os.path.relpath(d2, ROOT), len(full_shots(p['slug'])), 'images')
