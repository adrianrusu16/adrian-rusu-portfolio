"""Generate original, accessible architecture diagrams from verified source boundaries."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'public/images/diagrams'
OUT.mkdir(parents=True, exist_ok=True)
BG, LINE, BLUE, PINK, TEXT, MUTED = '#10151d', '#495a70', '#99b7d5', '#e5a2b1', '#f1f2f5', '#a5b0c0'

def base(title, height=560):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 {height}" role="img" aria-labelledby="title"><title id="title">{escape(title)}</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="{BLUE}"/></marker></defs><rect width="960" height="{height}" rx="12" fill="{BG}"/>']

def text(x,y,label,size=19,color=TEXT,anchor='middle',mono=False):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-family="{ "monospace" if mono else "Arial, sans-serif" }">{escape(label)}</text>'

def box(x,y,w,h,title,sub='',accent=False):
    color=PINK if accent else BLUE
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="{ "#251c28" if accent else "#17202b" }" stroke="{color}" stroke-opacity=".6"/>'+text(x+w/2,y+(h/2 if sub else h/2+7),title,23,color)+ (text(x+w/2,y+h/2+25,sub,15,MUTED) if sub else '')

def arrow(x1,y1,x2,y2,label='',side=False):
    return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{LINE}" stroke-width="2" marker-end="url(#arrow)" fill="none"/>'+ (text((x1+x2)/2+(18 if side else 0),(y1+y2)/2-8,label,15,MUTED,'start' if side else 'middle') if label else '')

def save(name,s):
    (OUT/f'{name}.svg').write_text('\n'.join(s+['</svg>'])+'\n')

s=base('PandaWave: Android surfaces, process boundary, native engine and backend',840)
s += [text(45,42,'PANDAWAVE / OWNERSHIP & BOUNDARIES',16,MUTED,'start',True)]
rows=[('AAOS system surfaces','Launcher · system media · vehicle controls',False),('Compose HMI / Media3','Presentation & Android playback execution',False),('EngineGateway → MediaEngineService','Binder / AIDL · Android process boundary',False),('PandaEngine','JNI / FFI · client state & domain decisions',True),('Canopy','canopy-api / gRPC · durable policy & media resolution',False)]
for i,(title,sub,accent) in enumerate(rows):
    y=70+i*124;s.append(box(130,y,700,84,title,sub,accent))
    if i<4:s.append(arrow(480,y+84,480,y+122))
s += [arrow(480,650,480,693),f'<path d="M235 714V694H725V714" stroke="{LINE}" fill="none" stroke-width="2"/>',box(65,714,340,80,'PostgreSQL','Durable data & current policy'),box(555,714,340,80,'Authorized media','Nginx byte delivery')]
save('pandawave',s)

s=base('Canopy control plane with PostgreSQL policy and a separate Nginx media byte path')
s += [text(40,36,'CANOPY / CONTROL PLANE + MEDIA DELIVERY',16,MUTED,'start',True),box(40,65,270,75,'PandaEngine','gRPC client'),arrow(310,102,365,102),box(367,65,545,75,'Canopy · Tonic gRPC','Transport adapters over domain services',True)]
for i,(title,sub) in enumerate([('Identity','Device sessions'),('Catalog / Discovery','Search & feeds'),('Profile / Playback','Durable state & policy')]):
    x=45+i*310;s.append(box(x,190,280,70,title,sub));s.append(arrow(x+140,260,x+140,300))
s += [f'<path d="M185 185V160H805V185M640 140V160M495 160V185" stroke="{LINE}" fill="none" stroke-width="2"/>',box(125,304,710,74,'Repository ports → PostgreSQL','Current policy, identity, metadata & profile state'),text(40,421,'BYTE PATH',15,MUTED,'start',True),box(40,446,240,72,'Android player','HTTP Range'),arrow(280,482,354,482),box(360,446,240,72,'Nginx','Private authorization'),arrow(600,482,673,482),box(680,446,240,72,'Managed media','Authorized bytes'),arrow(480,445,480,380,'Recheck policy',True)]
save('canopy',s)

s=base('Versioned canopy.v1 Protobuf contract consumed by PandaEngine and Canopy')
s += [text(40,40,'CANOPY-API / ONE CONTRACT, TWO CONSUMERS',16,MUTED,'start',True),box(190,80,580,105,'canopy.v1','Versioned Protobuf / gRPC contract',True),arrow(480,185,480,250,'Buf lint · build · breaking checks',True),box(240,255,480,82,'Generated Rust SDKs','Immutable Buf Schema Registry revision'),f'<path d="M480 337V389H240V413M480 389H720V413" fill="none" stroke="{LINE}" stroke-width="2" marker-end="url(#arrow)"/>',box(65,418,355,93,'PandaEngine','Client adapters'),box(540,418,355,93,'Canopy','Server implementations')]
save('canopy-api',s)

s=base('Vector growth: old allocation, new storage, constructed objects and spare capacity')
s += [text(42,44,'VECTOR<T> / STORAGE IS NOT OBJECT LIFETIME',16,MUTED,'start',True),text(42,96,'BEFORE · size 4 / capacity 4',18,BLUE,'start',True)]
for i in range(4):s.append(box(42+i*108,120,94,68,str(i),'live T'))
s += [text(590,152,'push_back(v[0])',24,PINK,'start',True),arrow(210,204,210,270),text(42,307,'AFTER · size 5 / capacity 8',18,BLUE,'start',True)]
for i in range(8):
    x=42+i*108
    if i<5:s.append(box(x,333,94,70,str(i),'new T' if i==4 else 'live T',i==4))
    else:s += [f'<rect x="{x}" y="333" width="94" height="70" rx="6" fill="none" stroke="{LINE}" stroke-dasharray="5 4"/>',text(x+47,375,'raw',18,MUTED)]
s += [text(42,457,'1 Allocate   2 Construct appended element   3 Relocate existing objects',18,TEXT,'start'),text(42,493,'4 Destroy old objects   5 Release old storage',18,MUTED,'start'),text(42,530,'Constructing the appended value first protects self-copy during growth.',17,PINK,'start')]
save('vector',s)

s=base('C++ object lifetime across nested scopes')
s += [text(40,42,'LIFETIME / NESTED SCOPES',16,MUTED,'start',True),f'<rect x="40" y="80" width="880" height="415" rx="8" fill="#131b25" stroke="{LINE}"/>',text(70,119,'function scope',19,BLUE,'start'),box(75,153,220,80,'Construct a','Tracer a{1}'),arrow(298,193,350,193),f'<rect x="359" y="140" width="510" height="212" rx="8" fill="#201b25" stroke="{PINK}"/>',text(385,176,'inner scope',18,PINK,'start'),box(385,210,210,80,'Construct b','Tracer b{2}'),arrow(595,250,638,250),box(645,210,195,80,'Destroy b','Scope ends',True),arrow(740,354,740,414),box(550,415,280,60,'Destroy a',''),text(90,447,'Reverse lifetime order.',21,MUTED,'start')]
save('lifetime',s)

s=base('An alignas(64) object occupies a 64-byte-aligned memory layout; this is not a benchmark')
s += [text(40,44,'ALIGNAS(64) / ADDRESS & STRIDE EXPERIMENT',16,MUTED,'start',True),text(40,110,'struct alignas(64) CacheLineData { int values[16]{}; };',23,PINK,'start',True)]
for row in range(3):
    y=170+row*95;s += [text(50,y+40,f'object {row}',20,MUTED,'start')]
    for i in range(16):s.append(f'<rect x="{185+i*42}" y="{y}" width="38" height="60" rx="3" fill="#17202b" stroke="{BLUE}" stroke-opacity=".6"/>')
    s.append(text(519,y+39,'16 × int',20,TEXT))
s += [text(42,489,'Inspect base alignment, element addresses and stride.',22,TEXT,'start'),text(42,526,'A layout experiment — no measured cache-speedup claim.',19,MUTED,'start')]
save('alignment',s)
print('Generated 6 source-grounded SVG diagrams.')
