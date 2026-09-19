"""Builds the six project pages in work/ from the data below.

Run from the repo root:  python tools/build_work.py
Edit the copy here, not in the generated HTML, or the next build will overwrite it.
Images live in work/img/<slug>/ and are exported from the Figma decks as they are,
so each project keeps its own visual language inside the site's frame.
"""
import html
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEHANCE = 'https://www.behance.net/rutujeetnayak'
LINKEDIN = 'https://www.linkedin.com/in/rutujeet-nayak-b5a47129b'

# `hl` wraps one word of a heading in the site's emphasis block: "before <hl>after"
PROJECTS = [
  dict(
    slug='uls', name='ULS', name_hl='', short='ULS',
    tag='Urban Labour System',
    one='A service that gives daily wage workers at urban nakas a verified identity, a fair wage agreement and a record of every day they work.',
    meta=[('Course', 'Service design'), ('Where', 'Labour nakas in Pune'),
          ('Methods', 'Field interviews, systems mapping, service blueprint'), ('Year', '2026')],
    behance=None, extra=None,
    problem=('HIRED IN <hl>TWO MINUTES</hl>. NOTHING WRITTEN DOWN.',
             'Every morning, workers wait at the naka and contractors pick them by appearance, familiarity or build. '
             'Years of skill cannot be proved, wages are paid in cash with no receipt, and the welfare schemes built '
             'for these workers rarely reach them.'),
    stats=[('30cr+', 'Workers registered on the e-Shram portal, most of them inactive'),
           ('60%', 'Unaware of, or confused about, the schemes meant for them'),
           ('90%', 'Receive no direct or usable benefit from those schemes')],
    shots=[
      ('01', 'ULS billboard reading Designed for Real Work, Not Office Work, with a worker in a hard hat', None, None),
      ('02', 'Thematic analysis grid of nine themes from field interviews', 'Nine themes from nine interviews',
       'Interviews at nakas and construction sites with workers, contractors and families, coded into what actually breaks: discovery, proof of skill, payment, safety and access.'),
      ('03', 'Persona of Sunita Kamble, a migrant daily wage earner from Beed', 'Five personas, one naka',
       'Workers, a semi-skilled worker, a contractor, a supervisor and the foreman in the middle, each with a line in their own words.'),
      ('04', 'Service definition for Naka Connect with structured access, coordinated hiring and traceable transactions', 'Naka Connect',
       'A coordinator-led service built on three moves: verify the worker, allocate by demand, and record every wage and attendance mark.'),
      ('05', 'Printed ULS ID card with a QR code on a lanyard', 'One identity, on paper and on a phone',
       'Every worker gets a QR-linked ULS ID. It works at the naka without a smartphone, and follows the worker from site to site.'),
      ('06', 'Foreman console screens designed in Hindi first', 'Hindi first, for the foreman on site',
       'Attendance, work allocation and daily wage logging, designed for the person who actually runs the site.'),
      ('07', 'Worker selection dashboard for contractors showing skills, reliability and wages', 'Hiring by skill, not by sight',
       'Contractors see verified skills, reliability and wages side by side, and the naka becomes a place a worker arrives at with the job already confirmed.'),
    ]),
  dict(
    slug='relique', name='RELIQUE', name_hl='', short='Relique',
    tag='Semiotics and semantics',
    one='A museum website where every artifact tells its own story, in the first person.',
    meta=[('Course', 'Semiotics and semantics'), ('Focus', 'Storytelling, history preservation'),
          ('Tools', 'Figma, FigJam'), ('Year', '2025')],
    behance='https://www.behance.net/gallery/241042181/Storytelling-Museum-Website', extra=None,
    problem=('HISTORY IS SHOWN AS <hl>FACTS</hl>.',
             'Museum collections are usually presented as dates, names and labels. Relique lets the objects that '
             'witnessed history speak for themselves, so a visit feels personal and emotional instead of static.'),
    stats=[('Explore', 'Start on a world map of museums and their collections'),
           ('Choose', 'Open a museum and go straight into its collections'),
           ('Listen', 'Hover an artifact and its My Story narration begins')],
    shots=[
      ('01', 'Relique title over a dark still life painting', None, None),
      ('02', 'Relique home page on desktop and mobile with featured artifacts and events', 'A collection you can wander',
       'Featured artifacts, museums around the world and upcoming events, set in a dark, gallery-like frame.'),
      ('03', 'Task flow from the map to a museum overview', 'One tap from home to a museum',
       'Explore opens an interactive map of museums, each with ratings and artifact counts, then a museum page to read its background or jump into its collection.'),
      ('04', 'My Story storytelling view with an artifact narrating its history', 'Artifacts that talk back',
       'My Story turns an object into the narrator, with audio and visuals, so history is heard from the thing that was there.'),
      ('05', 'About page and printed museum entry tickets', 'The world around it',
       'An About page, a mission to make history accessible to everyone, and museum tickets as physical touchpoints.'),
    ]),
  dict(
    slug='maison-tjrs', name='MAISON&nbsp;;TJRS', name_hl='', short='Maison&nbsp;;TJRS',
    tag='Design management',
    one='A concept couture maison where artists co-create garments that are archived as emotional artifacts, not sold as seasons.',
    meta=[('Course', 'Design management'), ('Type', 'Brand and business concept'),
          ('Collection', 'AW/25, The extremities of human emotion'), ('Year', '2025')],
    behance='https://www.behance.net/gallery/241088139/Design-Management-Concept-MAISON-TJRS', extra=None,
    problem=('LUXURY LOST ITS <hl>SOUL</hl> TO COMMERCE.',
             'Art is confined to galleries and fashion chases seasons instead of keeping stories. Maison ;TJRS brings '
             'the two together: every garment is made with an artist, numbered, certified and kept in a living archive.'),
    stats=[('1/1', 'Couture pieces, each certified and archived as an art object'),
           ('₹3-4L', 'Price of a single couture piece, at 15 to 25 percent cost to produce'),
           ('$10-12B', 'The artwear niche the maison is built to serve')],
    shots=[
      ('01', 'AW/25 exhibition and runway images for Maison TJRS', None, None),
      ('02', 'Couture 1 of 4, WIRE/WOUND/SUFFERING, a distressed leather jacket', 'Couture 1/4: Wire, wound, suffering',
       'Full-grain leather, hand waxed, distressed and reinforced with wire. Healing is possible, albeit grotesque.'),
      ('03', 'Couture 3 of 4, Darger, trousers printed with Henry Darger artwork', 'Couture 3/4: Darger',
       'Henry Darger\'s world reimagined in a new medium, on hand finished panels with archival ink.'),
      ('04', 'Artist, Maison, Archive flow from vision to living record', 'Artist ; Maison ; Archive',
       'The maison defines the emotion, artists co-create, and every piece is curated into the archive.'),
      ('05', 'Business model with couture, capsule and core tiers', 'Three tiers, one archive',
       'Couture for collectors, capsule for avant-garde buyers and a seasonless core, so scarcity funds the house without diluting it.'),
      ('06', 'Packaging and certificate of authenticity', 'Provenance built in',
       'Every garment ships with a certificate of authenticity and a place in the TJRS archive.'),
    ]),
  dict(
    slug='iccc-surveillance', name='ICCC', name_hl='SURVEILLANCE', short='ICCC Surveillance',
    tag='Object-oriented UX',
    one='A redesign of the command centre dashboard that monitors Taloja MIDC, rebuilt around how alerts are actually verified, escalated and resolved.',
    meta=[('Course', 'Object-oriented UX'), ('Team', 'Harsh Mane, Namandeep, Rutujeet Nayak'),
          ('Methods', 'Field observation, interviews, OOUX, task modelling'), ('Year', '2026')],
    behance=None,
    extra=('Watch the prototype', 'https://drive.google.com/drive/folders/1__KTXMdre0WThFkfeRdC77Gieae--57s'),
    problem=('THE ALERTS WORK. THE <hl>RESPONSE</hl> DOES NOT.',
             'The ICCC watches 310 cameras, 349 street lights and over 1,000 smart poles across 950+ industries. '
             'In the command centre we watched operators verify every alert by hand, memorise device IDs, and '
             'dispatch field teams over WhatsApp and phone calls with no record of what happened next.'),
    stats=[('3-7 min', 'Spent verifying a single alert by hand'),
           ('6 of 6', 'Operators coordinating field work only through WhatsApp and calls'),
           ('93.8%', 'Less cognitive load after regrouping the object model')],
    shots=[
      ('01', 'ICCC Surveillance cover slide', None, None),
      ('02', 'Six research findings from the ICCC command centre', 'Six findings from the command centre',
       'Field observation and interviews with six operators at the ICCC in Navi Mumbai, down to what slows a response.'),
      ('03', 'Dense object-action matrix and the cognitive load calculation', 'From 140 objects to 14',
       'We grouped a sparse object-action map into a dense one and measured it: the new model carries 6.2% of the original information load.'),
      ('04', 'Live map dashboard with device clusters and filters', 'A live map, always on',
       'Operators no longer cross-reference IP lists. Every alert has a place on the map, and critical ones stay visible.'),
      ('05', 'Device cards with status, event logs and one-click acknowledge', 'Every device, one click deep',
       'Status, severity, event log and affected industries in one card, with acknowledge or ignore right there.'),
      ('06', 'Alert summary with pinned counts, trend analysis and multi-page layout', 'The summary that stays pinned',
       'Active, faulty and critical counts stay on screen across tabs, with trend analysis to catch devices that keep failing.'),
    ]),
  dict(
    slug='canva-ai', name='CANVA AI', name_hl='REDESIGN', short='Canva AI redesign',
    tag='Conversational AI',
    one='A study of Canva\'s AI assistant through a bank of 50 prompts, and a redesign that keeps it inside your file and under your control.',
    meta=[('Type', 'UI/UX, conversational AI'), ('Framework', 'CAPABLE, built for this study'),
          ('Methods', 'Prompt testing, review analysis'), ('Year', '2025')],
    behance='https://www.behance.net/gallery/241041049/Redesign-of-Canvas-AI-Model',
    extra=('Open the prototype', 'https://www.figma.com/proto/TY5Rpqq4pruzzAytmbqi8o?page-id=104%3A397&node-id=271-10318&scaling=min-zoom'),
    problem=('IT COULD DESIGN. IT COULD NOT <hl>LISTEN</hl>.',
             '"Make the font more intense" was read as bold, not rock concert. An infographic landed in a new file '
             'instead of the slides. Corrections were forgotten one prompt later. Most of Canva\'s users are not '
             'designers, so the assistant has to understand intent, not just instructions.'),
    stats=[('180M', 'Monthly active users, most of them non-designers'),
           ('50', 'Prompts tested across code, design, image, write and video'),
           ('7', 'Lenses in the CAPABLE framework we built to judge the AI')],
    shots=[
      ('01', 'Canva AI project cover', None, None),
      ('02', 'Prompt tests on Canva AI for a pitch deck and a social post', 'Fifty prompts, written like real users',
       'A pitch deck for a brand, a cartoon social post and more, each with notes on what the AI got right and where it drifted.'),
      ('03', 'The CAPABLE framework with seven evaluation lenses', 'CAPABLE',
       'Contextual understanding, agency, proactive suggestion, aesthetic alignment, boundary awareness, learning and efficiency, each tied to a failure we saw.'),
      ('04', 'Redesigned Canva AI panel embedded next to a poster', 'An assistant that stays in the file',
       'The AI lives beside the poster, shows an example prompt, and signals when it is listening or working.'),
      ('05', 'Canva AI acting as a design consultant on a monotonous poster', 'From command to critique',
       'Told the poster "still feels monotonous", it diagnoses a layout problem and asks before changing anything.'),
      ('06', 'Canva AI saving and renaming the whole file from one compound command', 'One sentence, three actions',
       'It saves the changes and renames the whole file, not just the image, from a single compound request.'),
    ]),
  dict(
    slug='drivebuddy', name='DRIVE', name_hl='BUDDY', short='DriveBuddy',
    tag='UI design',
    one='A sensor that plugs into any car\'s OBD-II port, and a companion app that turns each driving lesson into scores and specific feedback.',
    meta=[('Type', 'UI design and user testing'), ('For', 'Driving schools and their learners'),
          ('Methods', 'Think-aloud tests, pre and post questionnaires'), ('Year', '2024')],
    behance='https://www.behance.net/gallery/241090369/DriveBuddy-A-Companion-for-Learning-Drivers', extra=None,
    problem=('EVERY MISTAKE, <hl>TIMESTAMPED</hl>.',
             'DriveBuddy records acceleration, braking, clutch and gear changes during a lesson, then shows the learner '
             'exactly where it went wrong, like brakes not pressed at an obstacle, with a manual and a video to fix it.'),
    stats=[('4', 'Skills scored every lesson: acceleration, braking, clutch and gears, confidence'),
           ('6', 'Users in think-aloud usability tests'),
           ('3', 'Tasks tested: book a lesson, review past lessons, check progress')],
    shots=[
      ('01', 'DriveBuddy cover with lesson history, progress and booking screens', None, None),
      ('02', 'DriveBuddy style guide with pastel palette and DM Sans', 'Calm on purpose',
       'Pastels and neutrals so the app never adds to the stress of someone who is about to drive.'),
      ('03', 'Lesson booking flow from date to confirmation', 'Booking in four taps',
       'Pick a date and time, check the instructor, route and lessons, confirm.'),
      ('04', 'Start lesson, live route and results screens', 'During and after the drive',
       'A lesson brief, the live route, and a result that says what to work on next.'),
      ('05', 'Lesson analysis screens with scores and timestamped mistakes', 'Feedback you can act on',
       'Each skill gets a score, each mistake gets a time, and each one links to a manual and a video.'),
      ('06', 'Questionnaire insights from usability testing', 'What six users told us',
       'Easy to learn, the feedback felt relevant, and the pain points showed us where navigation still needs work.'),
    ]),
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
</body>
</html>
'''.format(behance=BEHANCE, linkedin=LINKEDIN)


def hl(text):
    """'A <hl>B</hl> C' marks B as the heading's one emphasis block."""
    return text.replace('<hl>', '<span class="hl">').replace('</hl>', '</span>')


def img(slug, name, alt, eager=False):
    path = os.path.join(ROOT, 'work', 'img', slug, name + '.jpg')
    w, h = Image.open(path).size
    load = 'eager" fetchpriority="high' if eager else 'lazy'
    return (f'<img src="img/{slug}/{name}.jpg" width="{w}" height="{h}" '
            f'alt="{html.escape(alt)}" loading="{load}" decoding="async">')


def page(p, nxt):
    title = p['short'].replace('&nbsp;', ' ')
    link = p['behance'] or BEHANCE
    on_profile = p['behance'] is None
    cta_label = 'Full case study on Behance' if not on_profile else 'More work on Behance'
    h1 = p['name'] + (f' <span class="hl">{p["name_hl"]}</span>' if p['name_hl'] else '')
    meta = ''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k, v in p['meta'])
    extra = ''
    if p['extra']:
        extra = f'\n    <a href="{p["extra"][1]}" class="btn" target="_blank" rel="noopener">{p["extra"][0]} &#8599;</a>'
    stats = ''.join(f'\n    <div class="out card" data-reveal><b>{n}</b><span>{t}</span></div>' for n, t in p['stats'])

    cover = p['shots'][0]
    shots = ''
    for name, alt, head, body in p['shots'][1:]:
        shots += f'''
  <figure class="shot" data-reveal>
    <figcaption><h3>{head}</h3><p>{body}</p></figcaption>
    <div class="frame">{img(p['slug'], name, alt)}</div>
  </figure>'''

    ph, pb = p['problem']
    out = HEAD.format(title=title, desc=html.escape(p['one']))
    out += f'''
<header class="chead">
  <a href="../index.html#work" class="back">&larr; All work</a>
  <span class="kicker">{p['tag']}</span>
  <h1>{h1}</h1>
  <p class="one">{p['one']}</p>
  <div class="meta">{meta}</div>
  <div class="ctas">
    <a href="{link}" class="btn fill" target="_blank" rel="noopener" data-cursor="Behance">{cta_label} &#8599;</a>{extra}
  </div>
</header>

<div class="cover"><div class="frame">{img(p['slug'], cover[0], cover[1], eager=True)}</div></div>

<section class="band">
  <h2>{hl(ph)}</h2>
  <p>{pb}</p>
</section>

<section class="sec nums">
  <div class="outcome">{stats}
  </div>
</section>

<section class="shots">{shots}
</section>

<section class="sec">
  <a class="bh" href="{link}" target="_blank" rel="noopener" data-cursor="Behance" data-reveal>
    <div>
      <h2>THAT WAS THE <span class="hl">TRAILER</span></h2>
      <p>{'The full case study, with every step of the process, is on Behance.' if not on_profile else 'The full case study is on its way to Behance. The rest of the work is already there.'}</p>
    </div>
    <span class="rbtn" aria-hidden="true">&#8599;</span>
  </a>
  <a class="next card" href="{nxt['slug']}.html" data-reveal data-cursor="Next">
    <div><span class="lab">Next project</span><h3>{nxt['short']}</h3></div>
    <span class="rbtn" aria-hidden="true">&rarr;</span>
  </a>
</section>
'''
    out += FOOT
    return out


if __name__ == '__main__':
    for i, p in enumerate(PROJECTS):
        nxt = PROJECTS[(i + 1) % len(PROJECTS)]
        dest = os.path.join(ROOT, 'work', p['slug'] + '.html')
        with open(dest, 'w', encoding='utf-8', newline='\n') as f:
            f.write(page(p, nxt))
        print('wrote', os.path.relpath(dest, ROOT))
