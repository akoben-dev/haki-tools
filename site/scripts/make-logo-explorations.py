# Generates the three logo explorations (mark + horizontal wordmark) as flat filled-path SVGs.
import re, sys, os
site = sys.argv[1]
out = os.path.join(site, 'src/assets/brand/explorations')
os.makedirs(out, exist_ok=True)
G = '#9ee2bf'

def f(v): return ('%.2f' % v).rstrip('0').rstrip('.')

# Each shape: list of subpaths; each subpath a list of ('M'|'L', x, y) or ('A', r, sweep, large, x, y)
def poly(pts): return [('M',)+pts[0]] + [('L',)+p for p in pts[1:]]

def to_d(subs, k=1, dx=0, dy=0):
    d = []
    for sp in subs:
        for c in sp:
            if c[0] in 'ML': d.append(f'{c[0]}{f(c[1]*k+dx)},{f(c[2]*k+dy)}')
            else:
                _, r, large, sweep, x, y = c
                d.append(f'A{f(r*k)},{f(r*k)} 0 {large} {sweep} {f(x*k+dx)},{f(y*k+dy)}')
        d.append('Z')
    return ''.join(d)

# A · Cut Gem: today's gem silhouette, solid, with a faceted H cut out (stems end on lines parallel to the gem's lower edges).
gem = [(110,0),(330,0),(440,110),(220,400),(0,110)]
H = [(120,52),(184,52),(184,138),(256,138),(256,52),(320,52),(320,201.9),(256,286.3),(256,182),(184,182),(184,286.3),(120,201.9)]
A = dict(w=440, h=400, subs=[poly(gem), poly(H[::-1])])

# B · Rise: an open H whose stems and crossbar all climb on the same slope, so the letter doubles as a step up.
B = dict(w=320, h=400, subs=[poly([(0,173.3),(100,106.7),(100,250),(220,170),(220,66.7),(320,0),(320,400),(220,400),(220,250),(100,330),(100,400),(0,400)])])

# C · Node: two rounded stems joined by a round node instead of a bar: tools linked into one system.
C = dict(w=320, h=400, subs=[[('M',0,50),('A',50,0,1,100,50),('L',100,163.94),('A',70,0,1,220,163.94),('L',220,50),('A',50,0,1,320,50),
      ('L',320,350),('A',50,0,1,220,350),('L',220,236.06),('A',70,0,1,100,236.06),('L',100,350),('A',50,0,1,0,350)]])


# Round 2 (Everett, 2026-11-15: keep the H and T overlapping, as in today's gem).

# D · HT Gem: today's idea, redrawn bold. The gem's top table is the T's bar and the centre column its stem;
# the two side facets are the H's stems, tied to the T stem by the H crossbar.
D = dict(w=440, h=400, subs=[poly([(110,0),(330,0),(400,70),(244,70),(244,196),(268,196),(268,92),(422,92),(440,110),
      (268,336.7),(268,244),(244,244),(244,368.4),(220,400),(196,368.4),(196,244),(172,244),(172,336.7),(0,110),
      (18,92),(172,92),(172,196),(196,196),(196,70),(40,70)])])

# E · HT Gate: no gem. A T whose bar overhangs an H; the T stem runs down through the H crossbar.
E = dict(w=400, h=400, subs=[poly([(0,0),(400,0),(400,72),(236,72),(236,214),(300,214),(300,100),(380,100),(380,400),
      (300,400),(300,274),(236,274),(236,400),(164,400),(164,274),(100,274),(100,400),(20,400),(20,100),(100,100),
      (100,214),(164,214),(164,72),(0,72)])])

# F · Cut Gem HT: option A, but the solid T (top table + centre column) runs unbroken through the cut-out H.
left = [(128,44),(164,44),(164,138),(196,138),(196,182),(164,182),(164,259.8),(100,175.6),(100,72)]
right = [(440-x,y) for x,y in left][::-1]
F = dict(w=440, h=400, subs=[poly(gem), poly(left[::-1]), poly(right[::-1])])

hz = open(os.path.join(site, 'src/assets/brand/haki-horizontal.svg')).read()
letters = re.findall(r'<path class="cls-1" d="([^"]+)"', hz)[1:]  # drop the old mark, keep the HAKI TOOLS letters

for name, m in dict(a=A, b=B, c=C, d=D, e=E, f=F).items():
    d = to_d(m['subs'])
    open(f'{out}/{name}.svg','w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {m["w"]} {m["h"]}">\n  <path fill="{G}" fill-rule="evenodd" d="{d}"/>\n</svg>\n')
    # Wordmark: mark 136 tall, centred on the cap height of the letters (y 52–105.6), 34 units before the H.
    k = 136 / m['h']; mw = m['w'] * k
    x0 = 249.53 - 34 - mw; y0 = 78.84 - 68
    paths = [f'  <path fill="{G}" fill-rule="evenodd" d="{to_d(m["subs"], k, -x0, y0)}"/>'] + \
            [f'  <path fill="{G}" d="{to_d_l}"/>' for to_d_l in []]
    # shift letters by -x0 using their own absolute commands is messy, so translate the viewBox instead
    paths = [f'  <path fill="{G}" fill-rule="evenodd" d="{to_d(m["subs"], k, x0, y0)}"/>'] + [f'  <path fill="{G}" d="{l}"/>' for l in letters]
    open(f'{out}/{name}-horizontal.svg','w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x0)} 0 {f(727.62 - x0)} 156.77">\n' + '\n'.join(paths) + '\n</svg>\n')
print('ok')
