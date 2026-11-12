const $=s=>document.querySelector(s);
const screens={};document.querySelectorAll('.screen').forEach(s=>screens[s.id]=s);
const prog=$('#progress'),pn=$('#pn'),pf=$('#pf');
let cur=null;const hooks={};
function leave(el,instant){
  if(!el)return;
  if(instant){el.style.transition='none';el.classList.remove('active');requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition=''}));return}
  el.classList.remove('active');el.classList.add('out');
  setTimeout(()=>el.classList.remove('out'),550);
}
function enter(id){
  const el=screens[id];el.classList.remove('out');el.classList.add('active');
  const p=el.dataset.progress;
  if(p){pn.textContent=p+'/100';pf.style.transform='scaleX('+(p/100)+')';prog.classList.add('on')}else prog.classList.remove('on');
  if(hooks[id])hooks[id]();
}
function go(id){leave(cur);cur=screens[id];enter(id)}
(function(){
  const el=document.getElementById('sis');if(!el)return;
  const a=atob(el.dataset.w),u=new Uint8Array(a.length);
  for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i)^(((i*167+13)^((i*i)>>3))&255);
  el.src=URL.createObjectURL(new Blob([u],{type:'image/jpeg'}));
})();
document.querySelectorAll('.yes[data-next]').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.busy)return;b.dataset.busy=1;b.classList.add('pressed');
  go(b.dataset.next);
}));
document.querySelectorAll('.no').forEach(b=>b.addEventListener('click',()=>{
  const o=parseFloat(b.dataset.o||'1')*0.3;b.dataset.o=o;
  if(o<0.03){b.style.opacity=0;b.style.pointerEvents='none';setTimeout(()=>b.classList.add('gone'),600)}else b.style.opacity=o;
}));

const env=$('#env');let opened=false;
(function(){const f=env.querySelector('.flap'),f2=f.cloneNode(true);f2.setAttribute('class','flap2');env.appendChild(f2)})();
env.addEventListener('click',()=>{
  if(opened)return;opened=true;env.classList.add('open');
  let left=false;
  const done=()=>{if(left)return;left=true;leave(screens['env-s'],true)};
  env.addEventListener('animationend',e=>{if(e.target===env&&e.animationName==='envOut')done()});
  setTimeout(done,3200);
  setTimeout(()=>{cur=screens.greet;enter('greet')},2050);
  setTimeout(()=>go('q1'),4350);
});

const lf=$('#lf'),lh=$('#lh'),lbar=lf.parentElement;
let lv=0,lready=false,ldone=false,lt=null;
function hintTimer(){clearTimeout(lt);lh.classList.remove('show');lt=setTimeout(()=>{if(!ldone)lh.classList.add('show')},8000)}
function step(){const r=Math.random();return r<.8?2+Math.random()*3:r<.95?5+Math.random()*3:8+Math.random()*2}
hooks.load=()=>{
  lv=10;lf.style.transition='transform 3s cubic-bezier(.25,.8,.25,1)';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{lf.style.transform='scaleX(.1)'}));
  setTimeout(()=>{lready=true;hintTimer()},3000);
};
screens.load.addEventListener('click',()=>{
  if(!lready||ldone)return;
  lv+=step();
  lbar.classList.remove('pulse');void lbar.offsetWidth;lbar.classList.add('pulse');
  lf.style.transition='transform .5s cubic-bezier(.25,.8,.25,1)';
  if(lv>=100){lv=100;ldone=true;lh.classList.remove('show');setTimeout(()=>go('date'),450)}else hintTimer();
  lf.style.transform='scaleX('+(lv/100)+')';
});

const grid=$('#grid');
'MTWTFSS'.split('').forEach(d=>{const e=document.createElement('div');e.className='d';e.textContent=d;grid.appendChild(e)});
for(let i=0;i<6;i++)grid.appendChild(document.createElement('div'));
for(let d=1;d<=30;d++){
  const e=document.createElement('div');e.className='c'+(d===15?' on':'');e.textContent=d;
  if(d===15)e.addEventListener('click',()=>{if(e.classList.contains('sel'))return;e.classList.add('sel');setTimeout(()=>go('time'),450)});
  grid.appendChild(e);
}

const MIN=8,SPAN=16,line=$('#line'),m24=$('#m24'),m10=$('#m10'),tf=$('#tf'),tl=$('#tl'),ticks=$('#ticks');
let end=24,val=24,drag=false,W=0,raf=0,rect=null;
const frag=document.createDocumentFragment();
for(let h=8;h<=24;h++){
  const l=(h-MIN)/SPAN*100;
  const s=document.createElement('span');s.style.left=l+'%';frag.appendChild(s);
  if(h%2===0||h===10){const t=document.createElement('em');t.style.left=l+'%';t.textContent=h;frag.appendChild(t)}
}
ticks.appendChild(frag);
function measure(){W=line.offsetWidth}
function render(){
  raf=0;
  m24.style.transform='translate3d('+((val-MIN)/SPAN*W-12)+'px,0,0)';
  tf.style.transform='scaleX('+((val-10)/14)+')';
  const h=Math.round(val);
  tl.textContent='10:00 \u2013 '+h+':00 \u00b7 '+(h-10)+' hours';
}
function queue(){if(!raf)raf=requestAnimationFrame(render)}
measure();render();
hooks.time=()=>{measure();render()};
window.addEventListener('resize',()=>{measure();render()});
m24.addEventListener('pointerdown',e=>{
  drag=true;line.classList.remove('snap');measure();rect=line.getBoundingClientRect();
  m24.setPointerCapture(e.pointerId);m24.classList.add('active');
});
m24.addEventListener('pointermove',e=>{
  if(!drag)return;
  val=Math.max(18,Math.min(24,MIN+(e.clientX-rect.left)/rect.width*SPAN));
  queue();
});
function release(){
  if(!drag)return;drag=false;m24.classList.remove('active');
  end=Math.round(val);val=end;line.classList.add('snap');queue();
}
m24.addEventListener('pointerup',release);m24.addEventListener('pointercancel',release);
m10.addEventListener('pointerdown',()=>m10.classList.add('gone'));
$('#tc').addEventListener('click',()=>{
  const b=$('#tc');if(b.dataset.busy)return;b.dataset.busy=1;b.classList.add('pressed');
  end=Math.round(val);
  go('check');
});

hooks.letter=()=>{
  const ps=document.querySelectorAll('#letter .l');
  ps[2].textContent='Thou art one who loveth the open air, a quiet hour of rest and kind company, and so a day hath been prepared with all three in it.';
  ps[4].textContent='Thy place is kept and thy coming is awaited. Given by our own hands, with great anticipation.';
  const sl=$('.seal');if(sl)sl.remove();
  const chars=[],times=[];let t=0;
  ps.forEach(p=>{
    const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];
    while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(n=>{
      const f=document.createDocumentFragment();
      for(const c of n.nodeValue){
        if(c===' '){f.appendChild(document.createTextNode(' '));t+=20}
        else{const s=document.createElement('span');s.className='ch';s.textContent=c;f.appendChild(s);chars.push(s);times.push(t);t+=20}
      }
      n.parentNode.replaceChild(f,n);
    });
    t+=300;
  });
  const start=performance.now()+1000;let i=0;
  (function tick(now){
    while(i<chars.length&&now-start>=times[i]){chars[i].classList.add('on');i++}
    if(i<chars.length)requestAnimationFrame(tick);
  })(performance.now());
};

const rows=[...document.querySelectorAll('#list li')];
function reveal(i){const r=rows[i];if(r)r.classList.add('in')}
hooks.check=()=>reveal(0);
rows.forEach((r,i)=>r.addEventListener('click',()=>{
  if(r.classList.contains('done'))return;r.classList.add('done');
  if(i<rows.length-1)setTimeout(()=>reveal(i+1),250);else setTimeout(()=>go('letter'),800);
}));

requestAnimationFrame(()=>{cur=screens['env-s'];enter('env-s')});
