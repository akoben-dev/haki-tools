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

hz = open(os.path.join(site, 'src/assets/brand/haki-horizontal.svg')).read()
letters = re.findall(r'<path class="cls-1" d="([^"]+)"', hz)[1:]  # drop the old mark, keep the HAKI TOOLS letters

for name, m in dict(a=A, b=B, c=C).items():
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
