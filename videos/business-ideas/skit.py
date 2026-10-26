# Shared skit writer for batch 3 on: one language (Hindi voice, Hinglish captions), a fresh cast per video.
# An idea is a dict (see batch3.py); write(IDEAS) creates NN-slug/script.json for each.
# Beats: hero stuck -> mentor's idea -> question -> cost -> setup tip -> customer -> price -> daily earnings -> growth tip -> "life set!".
# place='farm' sets the story on a farm (farm, then a signboard on the field) instead of home, then a shop front.
import json, os
H = os.path.dirname(os.path.abspath(__file__))
NOTE = 'Figures rough estimates hain, jagah aur season ke hisaab se badalte hain'
SPEAKERS = ['hero', 'mentor', 'hero', 'mentor', 'mentor', 'cust', 'hero', 'mentor', 'mentor', 'hero']

def C(name, look, voice, speed=1.0, **kw): return dict(name=name, look=look, voice=[voice, speed], **kw)

def beats(idea):
    farm = idea.get('place') == 'farm'; start = idea.get('start', 'farm' if farm else 'home'); scene = 'farmshop' if farm else 'shop'
    got = idea.get('got', idea['item'])
    b = [
        dict(bg=start, cast=[['hero', 420, 1]], pose={'hero': 'sad'}, expr={'hero': 'sad'}, fx={'hero': 'sweat' if start in ('street', 'farm') else 'tears'}),
        dict(cast=[['hero', 290, 1], ['mentor', 790, -1]], pose={'hero': 'idle', 'mentor': 'point'}, expr={'hero': 'shock', 'mentor': 'smug'}, fx={'mentor': 'idea'}),
        dict(pose={'hero': 'scratch', 'mentor': 'hips'}, expr={'hero': 'think', 'mentor': 'neutral'}, fx={'hero': 'question'}),
        dict(pose={'hero': 'idle', 'mentor': 'count'}, expr={'hero': 'neutral', 'mentor': 'happy'}),
        dict(pose={'hero': 'think', 'mentor': 'explain'}, expr={'hero': 'think', 'mentor': 'smug'}),
        dict(bg=scene, cast=[['hero', 280, 1], ['cust', 790, -1]], pose={'hero': 'hips', 'cust': 'explain'}, expr={'hero': 'happy', 'cust': 'shock'}, fx={'cust': 'sweat'},
             hold={'cust': idea.get('xhold')} if idea.get('xhold') else {}),
        dict(pose={'hero': 'give', 'cust': 'idle'}, expr={'cust': 'happy'}, hold={'hero': idea['item'], 'cust': None}),
        dict(cast=[['hero', 240, 1], ['mentor', 560, -1], ['cust', 880, -1]], pose={'hero': 'money', 'mentor': 'count', 'cust': 'idle'}, expr={'hero': 'happy', 'mentor': 'happy', 'cust': 'lol'},
             hold={'hero': 'cash', 'cust': got}, fx={'hero': 'stars'}),
        dict(pose={'mentor': 'explain', 'hero': 'think'}, expr={'mentor': 'smug', 'hero': 'smug'}, fx={}),
        dict(cast=[['hero', 240, 1], ['mentor', 560, -1], ['cust', 870, -1]], pose={'hero': 'cheer', 'mentor': 'cheer', 'cust': 'cheer'}, expr={'hero': 'lol', 'mentor': 'lol', 'cust': 'lol'},
             hold={'hero': None, 'cust': None}, final=True),
    ]
    for k, (v, l) in idea['stats'].items(): b[k]['stat'] = [v, l]
    return b

def write(ideas):
    for idea in ideas:
        n = idea['num']; d = f"{H}/{n:02d}-{idea['slug']}"; os.makedirs(d, exist_ok=True)
        roles = {r: dict(idea[r]) for r in ('hero', 'mentor', 'cust')}; voices = {r: ch.pop('voice') for r, ch in roles.items()}
        ep = dict(num=n, of=100, title=idea['title'], sign=idea['sign'], kind=idea['kind'], final=idea['final'], note=NOTE, cast=roles,
                  **{k: idea[k] for k in ('signColor', 'signText', 'wall', 'awning', 'sackLabel') if k in idea})
        bs = beats(idea)
        lines = [[sp, bs[j], l[0], l[1]] for j, (sp, l) in enumerate(zip(SPEAKERS, idea['lines']))]
        json.dump(dict(out=f"{n:02d}-{idea['slug']}", ep=ep, voices=voices, sections=[dict(name=idea['title'], lines=lines)]), open(f"{d}/script.json", 'w'), ensure_ascii=False, indent=1)
    print(len(ideas), 'ideas')
