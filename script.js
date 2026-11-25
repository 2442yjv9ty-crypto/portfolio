"use strict";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => { v=clamp(v); return v*v*(3-2*v); };
const between = (p,a,b) => smooth((p-a)/(b-a));
const cinema=$('.cinema'), stage=$('.cinema-stage'), spool=$('.spool'), strand=$('.strand'), path=$('#strand-path');
const qwrap=$('#question-wrap'), o=$('#become-o'), lines=$$('.question-line');
const tape=$('#tape-layer'), tapeImg=$('.tape-image'), tapeFade=$('.tape-fade');
const manifesto=$('#manifesto'), mh=$('.manifesto h2'), mc=$('.manifesto-copy');
const phrases=$$('.tape-phrase'), tapeAnswer=$('.tape-answer');
const gallery=$('.gallery'), panels=$$('.panel'), caption=$('#scene-caption'), hint=$('#scroll-hint'), nav=$('#nav');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let raf=0, oX=0, oY=0, vw=0, vh=0;
function measure(){
  vw=innerWidth;vh=innerHeight;
  // Measure the O in the untransformed question before the scroll camera is applied.
  qwrap.style.transform='none';
  const r=o.getBoundingClientRect(), sr=stage.getBoundingClientRect();
  oX=r.left+r.width/2-sr.left; oY=r.top+r.height/2-sr.top;
  qwrap.style.transformOrigin=`${oX}px ${oY}px`;
  update();
}
function update(){
  if(reduced.matches) return;
  const travel=Math.max(1,cinema.offsetHeight-vh);
  const p=clamp(-cinema.getBoundingClientRect().top/travel);
  // Chapter 1: thread unwinds while the question is written into the frame.
  const draw=between(p,.015,.22), retire=between(p,.13,.30);
  spool.style.transform=`translateX(-50%) translateY(${-retire*vh*.11}px) scale(${1-retire*.38})`;
  spool.style.opacity=String(1-retire);
  strand.style.opacity=String(between(p,.02,.07)*(1-between(p,.22,.32)));
  path.style.strokeDashoffset=String(1000*(1-draw));
  lines.forEach((line,i)=>{line.style.clipPath=`inset(0 ${100*(1-between(p,.055+i*.034,.125+i*.034))}% 0 0)`});
  // Chapter 2: scale the WHOLE question around the actual letter O.
  const zoom=between(p,.24,.46);
  const scale=1+zoom*5.2;
  const dx=(vw*.5-oX)*zoom,dy=(vh*.44-oY)*zoom;
  qwrap.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`;
  qwrap.style.opacity=String(between(p,.025,.08)*(1-between(p,.405,.51)));
  // The tape's rolled top enters at the same screen focal point while the O is still visible.
  const tapeIn=between(p,.39,.48),track=between(p,.49,.75),tapeOut=between(p,.77,.835);
  tape.style.opacity=String(tapeIn*(1-tapeOut));
  tape.style.transform=`translateY(${-track*vh*.72}px) scale(${.60+tapeIn*.30})`;
  tapeFade.style.opacity=String(tapeOut);
  // Four annotations live at different vertical positions in one moving story.
  // Their individual blocks travel upward with the tape, not into a shared centre point.
  const storyMove=between(p,.49,.805);
  const storyItems=[...phrases,tapeAnswer];
  const startPositions=[1.15,1.75,2.35,2.95];
  storyItems.forEach((item,i)=>{
    const y=startPositions[i]*vh-storyMove*3.5*vh;
    // Fade only at the viewport edges; no text overlaps or covers the nav.
    const fadeIn=smooth((vh*.88-y)/(vh*.18));
    const fadeOut=smooth((y+item.offsetHeight-vh*.13)/(vh*.20));
    const visibility=clamp(fadeIn*fadeOut)*tapeIn*(1-tapeOut);
    item.style.transform=`translateY(${-storyMove*350}vh)`;
    item.style.opacity=String(visibility);
    item.style.visibility=visibility<.005?'hidden':'visible';
  });
  // Chapter 3: philosophy arrives before the tape has completely disappeared.
  const show=between(p,.805,.865), leave=between(p,.91,.97);
  manifesto.style.opacity=String(show*(1-leave));
  manifesto.style.transform=`translateY(${(1-show)*vh*.18-leave*vh*.16}px)`;
  mh.style.transform=`translateX(${(-4+between(p,.855,.95)*8)}vw)`;
  mc.style.opacity=String(between(p,.85,.89)*(1-between(p,.925,.965)));
  mc.style.transform=`translateY(${(1-between(p,.85,.95))*60}px)`;
  // Chapter 4: five physical panels rise individually over the exiting manifesto.
  const rise=between(p,.91,.995);
  gallery.style.transform=`translateY(${(1-rise)*110}%)`;
  gallery.style.pointerEvents=p>.985?'auto':'none';
  panels.forEach((panel,i)=>{
    const stagger=between(p,.91+i*.009,.976+i*.004);
    panel.style.transform=`translateY(${(1-stagger)*vh*.22}px)`;
  });
  caption.style.opacity=String(1-between(p,.23,.31));
  hint.style.opacity=String(1-between(p,.08,.16));
  nav.classList.toggle('on-red', $('#about').getBoundingClientRect().top<70);
}
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;update()})}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>requestAnimationFrame(measure));
reduced.addEventListener('change',()=>location.reload());
// Keep invisible gallery links out of the keyboard tab sequence until visible.
const io=new IntersectionObserver(()=>{if(reduced.matches)return; const visible=gallery.getBoundingClientRect().top<innerHeight*.5;panels.forEach(p=>p.tabIndex=visible?0:-1)}, {threshold:[0,.5,1]});io.observe(cinema);
addEventListener('load',measure);document.fonts.ready.then(measure);measure();
