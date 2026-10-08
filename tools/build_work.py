"""Builds the four project pages in work/ from the data below.

Run from the repo root:  python tools/build_work.py   (needs Pillow)
Edit the copy here and in tools/trailers/, not in the generated HTML, or the next build will
overwrite it.

Each page is a trailer, not a case study: title, detail boxes, then the cover and the story,
told in the order a viewer needs it: the problem, what was made and how it works, what changed, and
only then the project's video. The site's own elements (nav, title, detail boxes, the
full-project and next-project links, footer) keep the site's look exactly. The part that
shows the work, div.deck.p-<slug>, opens with the cover edge to edge and wears the project's
own deck styling, from
work/ui/<slug>.css, along with any interface rebuilt in code (with work/ui/<slug>.js), drawn
from the Figma decks, file uG8MdK8svbC6sa0wQ5kyIK.

The story for each project lives in tools/trailers/<slug>.html, written in the one shared
trailer layout (work/work.css, THE TRAILER: t-sec, t-lead, t-text, t-feat, t-inset, t-pair,
plate). {{video}} in that file is replaced with the project's player.
"""
import html
import re
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEHANCE = 'https://www.behance.net/rutujeetnayak'
LINKEDIN = 'https://www.linkedin.com/in/rutujeet-nayak-b5a47129b'

PROJECTS = [
  dict(
    slug='uls', title='ULS', short='ULS',
    meta=[('Course', 'Service design'),
          ('My role', 'End-to-end research and design'),
          ('Methods', 'Field interviews, systems mapping, service blueprint'),
          ('Year', '2026')],
    about='ULS, the Urban Labour System, brings a record to informal naka hiring: a QR-linked ID for every '
          'daily wage worker, and screens for workers, foremen and contractors built around it.',
    # the teaser ad the team made to launch the service: cinematic, not a walkthrough
    video=dict(dur=23.73, label='ULS teaser film', chapters=[]),
    # the deck is set in Satoshi (Fontshare); the rebuilt screens keep their own Inter
    fonts=['https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap',
           'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap'],
    libs=['ui/lucide.js'],
    behance='https://www.behance.net/gallery/255996487/ULS-Service-Design',
    # Behance flagged this one as spam; the gallery is a dead end for anyone but the owner,
    # so no secondary link to it from the page.
    hide_behance=True,
    cover_alt='ULS billboard reading Designed for Real Work, Not Office Work'),
  dict(
    slug='iccc-surveillance', title='ICCC SURVEILLANCE', short='ICCC Surveillance',
    meta=[('Course', 'Object-oriented UX'),
          ('My role', 'High-Fidelity UI, Research &amp; Analysis, OOUX Calculations, Diagramming'),
          ('Methods', 'Field observation, interviews, task modelling'),
          ('Year', '2026')],
    about='A redesign of the monitoring dashboard at MIDC’s Integrated Command and Control Centre (ICCC) in Taloja, '
          'rebuilt around how operators check, escalate and resolve alerts.',
    # walkthrough of the working coded prototype; chapter times checked frame by frame
    video=dict(dur=229.70, label='Walkthrough of the working ICCC dashboard prototype',
               chapters=[(0, 'Live map'), (12, 'Device card'), (28, 'Active alerts'), (80, 'Device health'),
                         (100, 'Alert list'), (144, 'Work tickets'), (164, 'Escalation chat'),
                         (192, 'Ticket progress')]),
    # the deck's DM Sans; the product screens are shown as they are, so no UI script
    fonts=['https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap'],
    behance='https://www.behance.net/gallery/255993261/ICCC-Surveillance-Object-Oriented-UX',
    cover_alt='ICCC Surveillance cover'),
  dict(
    slug='canva-ai', title='CANVA AI REDESIGN', short='Canva AI redesign',
    meta=[('Type', 'UI/UX, conversational AI'),
          ('My role', 'Visual Design, Research &amp; Analysis, AI Response Analysis, Framework Design'),
          ('Methods', 'Prompt testing, review analysis'),
          ('Year', '2025')],
    about='A redesign of Canva’s AI assistant for non-designers: it works inside the file you have open, '
          'asks before it changes anything, and reviews a design the way a consultant would.',
    # recording of the redesigned assistant working on a real poster
    video=dict(dur=63.90, label='Walkthrough of the redesigned Canva AI prototype',
               chapters=[(0, 'Ask Orb'), (8, 'Poster review'), (16, 'Fonts applied'), (24, 'New layout'),
                         (36, 'Second version'), (44, 'Invite message'), (52, 'Save and rename')]),
    fonts=['https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap'],
    libs=['ui/lucide.js'],
    behance='https://www.behance.net/gallery/241041049/Redesign-of-Canvas-AI-Model',
    cover_alt='Canva AI project cover'),
  dict(
    slug='relique', title='RELIQUE', short='Relique',
    meta=[('Course', 'Semiotics and semantics'),
          ('My role', 'Design Direction, Research, Image and Story Generation'),
          ('Tools', 'Figma, FigJam'),
          ('Year', '2025')],
    about='Relique is a museum website where artifacts tell their own stories, in the first person, and the '
          'design itself does the explaining that a label in a glass case usually does.',
    # walkthrough of the site prototype; chapter times checked frame by frame
    # the only video with sound: the artifacts' narration
    video=dict(dur=545.03, label='Walkthrough of the Relique website prototype', audio=True,
               chapters=[(0, 'Home'), (60, 'The artifact’s page'), (80, 'My Story: Akbar’s armour'),
                         (270, 'Museum map'), (300, 'Collections'), (380, 'My Story: the Waghnakh'),
                         (530, 'About Relique')]),
    fonts=['https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Gelasio:ital@0;1&display=swap'],
    behance='https://www.behance.net/gallery/241042181/Storytelling-Museum-Website',
    cover_alt='Relique title over a dark still life painting'),
]


# The index beside each full case study. Each entry is (group, label, image, y): the section
# starts `y` pixels down image `image` of work/full/<slug>/ (the images are 2000px wide), a
# little above the section's heading. Positions were read off the decks by OCR.
INDEX = {
  # written out as a page (tools/full/), so each entry points at a section's id instead
  'uls': [
    ('Context', 'In short', '#short', 0),
    ('Context', 'The naka', '#naka', 0),
    ('Context', 'The ecosystem', '#ecosystem', 0),
    ('Research', 'Interviews and schemes', '#research', 0),
    ('Research', 'Personas', '#people', 0),
    ('Research', 'Empathy square', '#empathy', 0),
    ('Research', 'Journey maps', '#journey', 0),
    ('Research', 'By choice or by chance', '#choice', 0),
    ('Research', 'What already exists', '#market', 0),
    ('Research', 'The problem', '#problem', 0),
    ('The service', 'ULS and its blueprint', '#service', 0),
    ('The service', 'The solution', '#solution', 0),
    ('The service', 'When it fails', '#recovery', 0),
    ('The service', 'Before and after', '#story', 0),
    ('Wrap-up', 'Impact and what I learnt', '#impact', 0),
  ],  # written out as a page (tools/full/), so each entry points at a section's id instead
  'iccc-surveillance': [
    ('Context', 'In short', '#short', 0),
    ('Context', 'The ICCC', '#context', 0),
    ('Context', 'Who uses it', '#users', 0),
    ('Research', 'On site', '#research', 0),
    ('Research', 'What we found', '#problems', 0),
    ('Research', 'Focus', '#focus', 0),
    ('Object-oriented UX', 'User stories to objects', '#ooux', 0),
    ('Object-oriented UX', 'What it saved', '#measure', 0),
    ('Object-oriented UX', 'Task ranking', '#tasks', 0),
    ('Design', 'The old dashboard', '#old', 0),
    ('Design', 'Information architecture', '#ia', 0),
    ('Design', 'The new dashboard', '#new', 0),
    ('Design', 'The prototype', '#film', 0),
    ('Wrap-up', 'What I learnt', '#learn', 0),
  ],
  'canva-ai': [
    ('Context', 'In short', '#short', 0),
    ('Context', 'Who uses Canva', '#users', 0),
    ('Context', 'What users said', '#voices', 0),
    ('Research', 'Fifty prompts', '#research', 0),
    ('Research', 'What went wrong', '#found', 0),
    ('Framework', 'CAPABLE', '#capable', 0),
    ('Framework', 'What it asked for', '#asks', 0),
    ('Design', 'Orb, step by step', '#orb', 0),
    ('Design', 'See it working', '#film', 0),
    ('Wrap-up', 'Outcome and what I learnt', '#outcome', 0),
  ],
  'relique': [
    ('Context', 'In short', '#short', 0),
    ('Context', 'About the project', '#about', 0),
    ('The website', 'Home page', '#home', 0),
    ('The website', 'Task flow', '#flow', 0),
    ('The website', 'Storytelling', '#story', 0),
    ('The website', 'About us', '#us', 0),
    ('Semiotics', 'Signs and meaning', '#signs', 0),
    ('Wrap-up', 'The prototype', '#film', 0),
    ('Wrap-up', 'What I learnt', '#learn', 0),
  ],
}

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
<!-- link previews (Instagram, WhatsApp, LinkedIn, X): the R logo, selected, on blue (og-image.png, 1200x630) -->
<meta property="og:type" content="website">
<meta property="og:title" content="{title} · Rutujeet’s Portfolio">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://www.rutujeetnayak.me/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The R logo, a blue R on a tilted paper block, selected with a Figma-style frame and handles, on Klein blue">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://www.rutujeetnayak.me/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Schibsted+Grotesk:wght@400..700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../lab.css">
<link rel="stylesheet" href="work.css">{extra}
</head>
<body>

<svg class="grain" aria-hidden="true"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>
<div class="cursor" id="cursor"><span class="dot"></span><span class="tag"></span></div>

<div class="navwrap"><nav class="nav">
  <a href="../index.html" class="logo" data-cursor="Home" aria-label="Rutujeet, home"><span class="l1"><svg viewBox="0 0 1062 1014" aria-hidden="true"><rect width="1062" height="1014"/><path transform="matrix(1 0 0 -1 142 853.5)" d="M594 288 747 0H499L377 251H295V0H74V688H495Q569 688 621.5 659.5Q674 631 700.5 582.5Q727 534 727 477Q727 414 693.0 363.0Q659 312 594 288ZM440 531H295V404H440Q466 404 484.0 422.5Q502 441 502 468Q502 495 484.0 513.0Q466 531 440 531Z"/></svg><i class="sel" aria-hidden="true"><b></b><b></b><b></b><b></b></i></span></a>
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
<!--UI-->
<script src="work.js"></script>
</body>
</html>
'''.format(behance=BEHANCE, linkedin=LINKEDIN)

# the player's icons: filled play and pause, the circular skip arrows, full screen
I_PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'
I_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z"/></svg>'
I_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 3.5v4h4"/></svg>'
I_FWD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M20 3.5v4h-4"/></svg>'
I_FULL = ('<svg class="i-full" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>'
          '<svg class="i-exit" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5"/></svg>')
# sound on and off: Lucide's volume-2 and volume-x
I_SPK = 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'
I_VOL = (f'<svg class="i-on" viewBox="0 0 24 24" aria-hidden="true"><path d="{I_SPK}"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>'
         f'<svg class="i-off" viewBox="0 0 24 24" aria-hidden="true"><path d="{I_SPK}"/><path d="M22 9l-6 6M16 9l6 6"/></svg>')


def summary(text, limit=155):
    """The meta description: the lead paragraph, cut at a word boundary rather than mid-word."""
    if len(text) <= limit:
        return text
    return text[:limit - 1].rsplit(' ', 1)[0].rstrip(',;:') + '…'


def shots(slug):
    folder = os.path.join(ROOT, 'work', 'img', slug)
    return sorted(f[:-5] for f in os.listdir(folder) if f.endswith('.webp'))


def img(slug, name, alt, eager=False):
    w, h = Image.open(os.path.join(ROOT, 'work', 'img', slug, name + '.webp')).size
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<img src="img/{slug}/{name}.webp" width="{w}" height="{h}" '
            f'alt="{html.escape(alt)}" loading="{load}" decoding="async">')


def mmss(t):
    t = int(t)
    return '%d:%02d' % (t // 60, t % 60)


def player(p):
    """The project's video at a fixed size in the page grid, with its own controls (work.js).
    Encoded to work/vid/<slug>.mp4 (H.264, 1600px), plus a VP9 .webm for browsers without
    H.264, and a .webp poster frame. Only a video marked audio=True keeps its sound (Relique's,
    AAC / Opus); it gets a sound button, and work.js unmutes it when the viewer presses play.
    Chapters, where the video has parts, sit under it as buttons and as ticks on the seek bar."""
    slug, v = p['slug'], p['video']
    w, h = Image.open(os.path.join(ROOT, 'work', 'vid', slug + '.webp')).size
    dur = v['dur']
    marks = ''.join(f'<i class="vp-mark" style="left:{t / dur * 100:.2f}%"></i>'
                    for t, _ in v['chapters'] if t > 0)
    chapters = ''
    if v['chapters']:
        items = ''.join(f'<li><button type="button" data-t="{t}"><span>{mmss(t)}</span>{html.escape(n)}</button></li>'
                        for t, n in v['chapters'])
        chapters = f'\n  <ol class="vp-ch" aria-label="Chapters">{items}</ol>'
    audio = v.get('audio')
    vol = (f'    <button type="button" class="vp-vol" aria-label="Turn sound on">{I_VOL}</button>\n' if audio else '')
    return (f'<figure class="vp{" muted" if audio else ""}" data-dur="{dur}"{" data-audio" if audio else ""} style="--ar:{w}/{h}">\n'
            f'  <div class="vp-screen">\n'
            f'    <video poster="vid/{slug}.webp" width="{w}" height="{h}" muted loop playsinline preload="none" '
            f'aria-label="{html.escape(v["label"])}">'
            f'<source src="vid/{slug}.mp4" type=\'video/mp4; codecs="avc1.640028"\'>'
            f'<source src="vid/{slug}.webm" type=\'video/webm; codecs="vp9"\'></video>\n'
            f'    <button type="button" class="vp-big" aria-label="Play video">{I_PLAY}</button>\n'
            f'  </div>\n'
            f'  <div class="vp-bar">\n'
            f'    <button type="button" class="vp-play" aria-label="Play">{I_PLAY}{I_PAUSE}</button>\n'
            f'    <button type="button" class="vp-back vp-skip" aria-label="Back 10 seconds">{I_BACK}<b>10</b></button>\n'
            f'    <button type="button" class="vp-fwd vp-skip" aria-label="Forward 10 seconds">{I_FWD}<b>10</b></button>\n'
            f'{vol}'
            f'    <span class="vp-time"><span class="vp-cur">0:00</span><span class="vp-dur"> / {mmss(dur)}</span></span>\n'
            f'    <div class="vp-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" '
            f'aria-valuemax="{int(dur)}" aria-valuenow="0" aria-valuetext="0:00 of {mmss(dur)}">'
            f'{marks}<div class="vp-fill"></div><div class="vp-knob"></div></div>\n'
            f'    <button type="button" class="vp-full" aria-label="Full screen">{I_FULL}</button>\n'
            f'  </div>{chapters}\n'
            f'</figure>')


def trailer(p):
    path = os.path.join(ROOT, 'tools', 'trailers', p['slug'] + '.html')
    with open(path, encoding='utf-8') as f:
        return f.read().replace('{{video}}', player(p))


def full_shots(slug):
    """Images for the on-site case study, work/full/<slug>/NN.jpg, in order."""
    folder = os.path.join(ROOT, 'work', 'full', slug)
    if not os.path.isdir(folder):
        return []
    return sorted(f for f in os.listdir(folder) if f.endswith('.jpg'))


def written(slug):
    """A case study written out as a page, tools/full/<slug>.html: real text in the deck's
    style, with only the diagrams, photos and screens as pictures (work/full/<slug>/*.webp).
    It replaces the stack of slide images, whose text came out too small to read."""
    path = os.path.join(ROOT, 'tools', 'full', slug + '.html')
    if not os.path.exists(path):
        return None
    with open(path, encoding='utf-8') as f:
        text = f.read()
    # one stray </div> closes the page's column early and drops everything after it into the
    # index column, so refuse to build an unbalanced page
    for tag in ('div', 'section', 'figure'):
        opened, closed = len(re.findall(rf'<{tag}[\s>]', text)), text.count(f'</{tag}>')
        if opened != closed:
            raise SystemExit(f'{path}: {opened} <{tag}> but {closed} </{tag}>')
    return text


def has_full(slug):
    return bool(written(slug) or full_shots(slug))


def index_nav(slug, sizes):
    """The fixed index beside the deck: groups of section links. Each link carries where its
    section starts as a fraction of its image's height, which work.js turns into a scroll
    position (the images are stacked, so this holds at any width)."""
    items = INDEX.get(slug)
    if not items:
        return ''
    out, group = '', None
    for i, (g, label, img_name, y) in enumerate(items):
        if g != group:
            out += ('\n    </ol>' if group else '') + f'\n    <p>{html.escape(g)}</p>\n    <ol>'
            group = g
        if img_name.startswith('#'):   # a written case study: the section's own id
            out += (f'\n      <li><a href="{img_name}" data-target="{img_name[1:]}">'
                    f'{html.escape(label)}</a></li>')
            continue
        h = sizes[img_name + '.jpg'][1]
        out += (f'\n      <li><a href="#s{i + 1}" data-shot="{img_name}" data-y="{y / h:.4f}">'
                f'{html.escape(label)}</a></li>')
    return ('\n<nav class="findex" aria-label="Sections of the case study">'
            '\n  <button type="button" class="findex-toggle" aria-expanded="false">Sections</button>'
            '\n  <div class="findex-list">' + out + '\n    </ol>\n  </div>\n</nav>')


def full_page(p, nxt):
    """The whole deck on one page. Every image is stacked flush against the next with no
    gap at all, inside a single ink frame, so it reads as one continuous scroll. Only the
    first image loads eagerly; the rest arrive as you reach them. Every image carries its
    real width and height so nothing reflows while they load. An index of the deck's
    sections stays fixed beside it (INDEX, index_nav), so a visitor can skip straight to
    the solution."""
    text = written(p['slug'])
    extra = ''
    if text:
        body = '\n<div class="fcs-body">\n' + text.replace('{{video}}', player(p)) + '</div>'
        nav = index_nav(p['slug'], {})
        for url in p.get('fonts', []):
            extra += f'\n<link href="{url}" rel="stylesheet">'
        extra += f'\n<link rel="stylesheet" href="ui/{p["slug"]}.css">'
        lede = 'The full case study: the research, the method and the design, start to finish.'
    else:
        names = full_shots(p['slug'])
        sizes = {n: Image.open(os.path.join(ROOT, 'work', 'full', p['slug'], n)).size for n in names}
        imgs = ''
        for i, n in enumerate(names):
            w, h = sizes[n]
            load = 'eager" fetchpriority="high' if i == 0 else 'lazy'
            imgs += (f'\n  <img src="full/{p["slug"]}/{n}" data-name="{n[:-4]}" width="{w}" height="{h}" '
                     f'alt="" loading="{load}" decoding="async">')
        body = f'\n<section class="full">{imgs}\n</section>'
        nav = index_nav(p['slug'], sizes)
        lede = 'The full case study, every slide, start to finish.'
    out = HEAD.format(title=p['short'] + ' · Full case study',
                      desc=html.escape(summary(p['about'])), extra=extra)
    if text:
        # A written case study wears its deck the whole way down, like its trailer: the
        # project's own cover edge to edge, then the index and the story on the deck's ground.
        # No site title block; the cover is the title.
        out += (f'\n<div class="deck fcs p-{p["slug"]}">\n'
                f'<h1 class="sr-only">{p["short"]}, the full case study</h1>\n'
                f'<figure class="t-cover">{img(p["slug"], shots(p["slug"])[0], p["cover_alt"], eager=True)}</figure>\n'
                f'<div class="fwrap">{nav}{body}\n</div>\n</div>\n')
    else:
        out += f'''
<header class="fhead">
  <a class="fback" href="{p['slug']}.html" data-cursor="Back">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12h-16M11 5l-7 7 7 7"/></svg>
    Back to {p['short']}
  </a>
  <h1>{p['title']}</h1>
  <p>{lede}</p>
</header>

<div class="fwrap">{nav}{body}
</div>
'''
    out += f'''
<section class="sec end">
  <a class="next card" href="{p['slug']}.html" data-reveal data-cursor="Back">
    <div><h2>Back to {p['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12h-16M11 5l-7 7 7 7"/></svg></span>
  </a>
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><h2>Next: {nxt['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h16M13 5l7 7-7 7"/></svg></span>
  </a>
</section>
'''
    return out + FOOT.replace('<!--UI-->', '<script src="full.js"></script>' if nav else '')


def page(p, nxt):
    names = shots(p['slug'])
    full = has_full(p['slug'])
    on_profile = p['behance'] is None
    link = (p['slug'] + '-full.html') if full else (p['behance'] or BEHANCE)
    # When the case study lives on the site, Behance drops to a secondary line under it.
    alt = ''
    if full and not p.get('hide_behance'):
        alt = ('\n  <a class="bhalt" href="%s" target="_blank" rel="noopener" data-cursor="Behance" data-reveal>'
               '\n    <span>%s</span>'
               '\n    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>'
               '\n  </a>' % (p['behance'] or BEHANCE,
                             'Also on Behance' if not on_profile else 'More work on Behance'))
    meta = ''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k, v in p['meta'])
    # the project's own type and its own stylesheet, only on its own page
    extra = ''
    for url in p.get('fonts', []):
        extra += f'\n<link href="{url}" rel="stylesheet">'
    extra += f'\n<link rel="stylesheet" href="ui/{p["slug"]}.css">'
    out = HEAD.format(title=p['short'], desc=html.escape(summary(p['about'])), extra=extra)
    lede = ('The research, the method and the full design, on one page.' if written(p['slug']) else
            'The research, the models and every slide of the case study, on one page.')
    tgt = '' if full else ' target="_blank" rel="noopener"'
    arrow = 'M3.5 12h16M13 5l7 7-7 7' if full else 'M6 18 18 6M8 6h10v10'
    msg = (lede if full else 'The full case study, with every step of the process.' if not on_profile
           else 'The full case study is on its way. The rest of the work is already there.')
    bar = (f'<a class="bh" href="{link}"{tgt} data-cursor="{"Read" if full else "Behance"}" data-reveal>\n'
           f'    <div>\n'
           f'      <h2>{"VIEW FULL CASE STUDY" if full else "VIEW ON BEHANCE"}</h2>\n'
           f'      <p>{msg}</p>\n'
           f'    </div>\n'
           f'    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="{arrow}"/></svg></span>\n'
           f'  </a>')
    story = trailer(p)
    # Where the solution starts ({{fullcase}}), a small link in the deck's own style says this
    # page is the short version; the site's big bar stays at the end.
    teaser = (f'<p class="t-teaser"><span>This page is the short version.</span>'
              f'<a href="{link}" data-cursor="Read">Full case study<svg viewBox="0 0 24 24" aria-hidden="true">'
              f'<path d="M3.5 12h16M13 5l7 7-7 7"/></svg></a></p>')
    story = story.replace('{{fullcase}}', teaser if full else '')
    out += f'''
<header class="chead">
  <h1>{p['title']}</h1>
  <div class="meta">{meta}</div>
</header>

<div class="deck p-{p['slug']}">
<figure class="t-cover">{img(p['slug'], names[0], p['cover_alt'], eager=True)}</figure>
<div class="t-body">
{story}
</div>
</div>
<section class="sec end">
  {bar}{alt}
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><h2>Next: {nxt['short']}</h2></div>
    <span class="rbtn" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h16M13 5l7 7-7 7"/></svg></span>
  </a>
</section>
'''
    libs = ''.join(f'<script src="{src}"></script>\n' for src in p.get('libs', []))
    if os.path.exists(os.path.join(ROOT, 'work', 'ui', p['slug'] + '.js')):
        libs += f'<script src="ui/{p["slug"]}.js"></script>'
    if 'cs-zoom' in story:   # a diagram that opens full size: the overlay lives in full.js
        libs += '\n<script src="full.js"></script>'
    return out + FOOT.replace('<!--UI-->', libs)


if __name__ == '__main__':
    only = os.environ.get('ONLY')
    for i, p in enumerate(PROJECTS):
        if only and p['slug'] != only:
            continue
        dest = os.path.join(ROOT, 'work', p['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8', newline='\n') as f:
            f.write(page(p, PROJECTS[(i + 1) % len(PROJECTS)]))
        print('wrote', os.path.relpath(dest, ROOT))
        if has_full(p['slug']):
            d2 = os.path.join(ROOT, 'work', p['slug'] + '-full.html')
            with open(d2, 'w', encoding='utf-8', newline='\n') as f2:
                f2.write(full_page(p, PROJECTS[(i + 1) % len(PROJECTS)]))
            print('wrote', os.path.relpath(d2, ROOT), '(written)' if written(p['slug']) else '%d images' % len(full_shots(p['slug'])))
