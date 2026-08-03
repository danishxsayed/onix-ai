/* ── PARTICLES ── */
const cv = document.getElementById('c'), cx = cv.getContext('2d');
let W, H, pts = [], mouse = {x:-9999,y:-9999};
function resize(){ W=cv.width=innerWidth; H=cv.height=innerHeight; }
resize(); addEventListener('resize',resize);
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
class P{
  constructor(){ this.reset(); }
  reset(){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-.5)*.28; this.vy=(Math.random()-.5)*.28; this.r=Math.random()*1+.3; this.a=Math.random()*.35+.08; this.gold=Math.random()>.55; }
  tick(){ this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset(); const dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy); if(d<110){this.x-=dx*.014;this.y-=dy*.014;} }
  draw(){ cx.beginPath(); cx.arc(this.x,this.y,this.r,0,Math.PI*2); cx.fillStyle=this.gold?`rgba(196,160,82,${this.a})`:`rgba(255,255,255,${this.a*.45})`; cx.fill(); }
}
for(let i=0;i<100;i++) pts.push(new P());
function conns(){
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
    const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<110){ cx.strokeStyle=`rgba(196,160,82,${(1-d/110)*.1})`; cx.lineWidth=.4; cx.beginPath(); cx.moveTo(pts[i].x,pts[i].y); cx.lineTo(pts[j].x,pts[j].y); cx.stroke(); }
  }
}
function animP(){ cx.clearRect(0,0,W,H); conns(); pts.forEach(p=>{p.tick();p.draw();}); requestAnimationFrame(animP); }
animP();

/* ── CURSOR ── */
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
function animC(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; cur.style.left=mx+'px'; cur.style.top=my+'px'; curR.style.left=rx+'px'; curR.style.top=ry+'px'; requestAnimationFrame(animC); }
animC();
document.querySelectorAll('a,button,.lc,.feat-card,.testi-card,.tlg,.ai-feat,.fc').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.classList.add('big');curR.classList.add('big');});
  el.addEventListener('mouseleave',()=>{cur.classList.remove('big');curR.classList.remove('big');});
});

/* ── NAV + SCROLL BAR ── */
const nav=document.getElementById('mainNav'),spb=document.getElementById('spb');
addEventListener('scroll',()=>{
  nav.classList.toggle('scrolled',scrollY>60);
  spb.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
});

/* ── REVEAL ── */
const obs=new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* ── SCORE BARS ── */
const sobs=new IntersectionObserver(en=>en.forEach(e=>{
  if(e.isIntersecting){ e.target.querySelectorAll('.sb-fill').forEach(b=>{const w=b.style.width;b.style.width='0';setTimeout(()=>b.style.width=w,300);}); sobs.unobserve(e.target); }
}),{threshold:.3});
document.querySelectorAll('.score-card').forEach(el=>sobs.observe(el));

/* ── FILTERS ── */
document.querySelectorAll('.fc').forEach(c=>c.addEventListener('click',function(){document.querySelectorAll('.fc').forEach(x=>x.classList.remove('active'));this.classList.add('active');}));

/* ── COUNTERS ── */
function count(el,t,s,dur=2000){
  const start=performance.now();
  const ease=p=>1-Math.pow(1-p,3);
  function tick(now){ const p=Math.min((now-start)/dur,1); const v=Math.floor(ease(p)*t); el.textContent=v.toLocaleString()+s; if(p<1)requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
}
const cobs=new IntersectionObserver(en=>en.forEach(e=>{
  if(e.isIntersecting){ cobs.unobserve(e.target); e.target.querySelectorAll('[data-t]').forEach(el=>count(el,+el.dataset.t,el.dataset.s)); }
}),{threshold:.5});
const hs=document.querySelector('.hero-stats');
if(hs) cobs.observe(hs);

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn-p,.btn-o,.nbtn-solid,.nbtn').forEach(b=>{
  b.addEventListener('mousemove',function(e){ const r=this.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2; this.style.transform=`translate(${x*.15}px,${y*.22}px)`; });
  b.addEventListener('mouseleave',function(){ this.style.transform=''; });
});

/* ── PARALLAX HERO ── */
addEventListener('scroll',()=>{
  const sy=scrollY;
  const g=document.querySelector('.h-grid'); if(g) g.style.transform=`translateY(${sy*.25}px)`;
  const gl=document.querySelector('.h-glow'); if(gl) gl.style.transform=`translate(-50%,calc(-50% + ${sy*.12}px))`;
  const orb=document.querySelector('.orb1'); if(orb) orb.style.transform=`translateY(${-sy*.06}px)`;
});

/* ── HERO LOGO SHIMMER ── */
const heroLogo = document.querySelector('.hero-logo-svg');
if(heroLogo){
  let shimmerAngle = 0;
  setInterval(()=>{
    shimmerAngle = (shimmerAngle+1)%360;
    heroLogo.style.filter = `drop-shadow(0 0 ${20+8*Math.sin(shimmerAngle*Math.PI/180)}px rgba(196,160,82,${0.15+0.08*Math.sin(shimmerAngle*Math.PI/180)}))`;
  },40);
}

/* ── TYPING EFFECT in search placeholder ── */
const inp=document.querySelector('.hero-search input');
if(inp){
  const phrases=['Search by industry, revenue, country…','Find SaaS businesses in Southeast Asia…','Luxury brands for acquisition under $10M…','Profitable e-commerce with high margins…'];
  let pi=0,ci=0,deleting=false;
  function typeNext(){
    const phrase=phrases[pi];
    if(!deleting){
      inp.placeholder=phrase.slice(0,++ci);
      if(ci===phrase.length){deleting=true;setTimeout(typeNext,2000);return;}
      setTimeout(typeNext,55);
    }else{
      inp.placeholder=phrase.slice(0,--ci);
      if(ci===0){deleting=false;pi=(pi+1)%phrases.length;setTimeout(typeNext,400);return;}
      setTimeout(typeNext,28);
    }
  }
  setTimeout(typeNext,1500);
}

/* ── CONTACT FORM TABS ── */
const tabs = document.querySelectorAll('.tab-btn');
if (tabs.length > 0) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const role = tab.dataset.tab;
      const budgetLabel = document.getElementById('budgetLabel');
      const budgetInput = document.getElementById('budgetInput');
      const roleInput = document.getElementById('roleInput');
      
      if (roleInput) roleInput.value = role;

      if (role === 'buyer') {
        budgetLabel.textContent = 'ACQUISITION BUDGET';
        budgetInput.placeholder = '₹1Cr - ₹10Cr';
      } else if (role === 'seller') {
        budgetLabel.textContent = 'EXPECTED VALUATION';
        budgetInput.placeholder = '₹5Cr - ₹20Cr';
      } else {
        budgetLabel.textContent = 'PORTFOLIO VALUE';
        budgetInput.placeholder = '₹50Cr+';
      }
    });
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    // Netlify will handle the form submission automatically.
    // We update the button text to 'SENDING...' for better user feedback.
    const btn = contactForm.querySelector('.submit-btn span');
    btn.innerHTML = 'SENDING...';
  });
}

/* ── GLOBAL REDIRECT ── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, .btn-p, .btn-o, .nbtn, .nbtn-solid, .lc-cta');
  if (btn) {
    // If it's the mobile toggle, let it open the menu
    if (btn.classList.contains('mob-toggle')) return;
    
    // If already on contact page AND it's the submit OR a tab button, don't redirect
    if (window.location.pathname.endsWith('contact.html')) {
        if (btn.classList.contains('submit-btn') || btn.classList.contains('tab-btn')) return;
    }
    
    e.preventDefault();
    window.location.href = 'contact.html';
  }
});

/* ── MOBILE MENU ── */
const mobToggle = document.getElementById('mobToggle');
const mobMenu = document.getElementById('mobMenu');
if (mobToggle && mobMenu) {
  mobToggle.addEventListener('click', () => {
    mobToggle.classList.toggle('active');
    mobMenu.classList.toggle('active');
    document.body.style.overflow = mobMenu.classList.contains('active') ? 'hidden' : '';
  });
  mobMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobToggle.classList.remove('active');
      mobMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}
