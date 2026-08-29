(function(){
  'use strict';

  var marquee=document.querySelector('[data-logo-marquee]');
  if(!marquee) return;

  var initialized=false;

  function init(){
    if(initialized) return;
    initialized=true;

    var track=marquee.querySelector('.logo-track');
    var toggle=document.querySelector('[data-logo-toggle]');
    if(!track) return;

    var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    var hoverPaused=false;
    var manualPaused=false;
    var interacting=false;
    var dragging=false;
    var visible=true;
    var running=false;
    var rafId=0;
    var startX=0;
    var startScroll=0;
    var lastTime=0;
    var speed=34;

    document.querySelectorAll('.brand-logo img').forEach(function(img){
      img.addEventListener('error',function(){
        var card=img.closest('.brand-logo');
        if(card) card.classList.add('image-missing');
      },{once:true});
    });

    function halfWidth(){return track.scrollWidth/2;}
    function normalize(){
      var half=halfWidth();
      if(!half) return;
      if(marquee.scrollLeft>=half) marquee.scrollLeft-=half;
      if(marquee.scrollLeft<0) marquee.scrollLeft+=half;
    }

    function shouldRun(){
      return visible&&!reduceMotion.matches&&!manualPaused&&!hoverPaused&&!interacting&&!document.hidden;
    }

    function stopAuto(){
      running=false;
      if(rafId){cancelAnimationFrame(rafId);rafId=0;}
    }

    function frame(now){
      if(!shouldRun()){stopAuto();return;}
      var delta=lastTime?Math.min(40,now-lastTime):16;
      marquee.scrollLeft+=(speed*delta)/1000;
      normalize();
      lastTime=now;
      rafId=requestAnimationFrame(frame);
    }

    function startAuto(){
      if(running||!shouldRun()) return;
      running=true;
      lastTime=performance.now();
      rafId=requestAnimationFrame(frame);
    }

    function refreshAuto(){
      stopAuto();
      if(shouldRun()) startAuto();
    }

    function updateToggle(){
      if(!toggle) return;
      var paused=manualPaused||reduceMotion.matches;
      toggle.textContent=paused?'▶':'Ⅱ';
      toggle.setAttribute('aria-pressed',paused?'true':'false');
      toggle.setAttribute('aria-label',paused?'Retomar carrossel de marcas':'Pausar carrossel de marcas');
      toggle.title=paused?'Retomar carrossel':'Pausar carrossel';
    }

    marquee.addEventListener('mouseenter',function(){hoverPaused=true;refreshAuto();});
    marquee.addEventListener('mouseleave',function(){hoverPaused=false;refreshAuto();});
    marquee.addEventListener('focusin',function(){hoverPaused=true;refreshAuto();});
    marquee.addEventListener('focusout',function(){hoverPaused=false;refreshAuto();});

    marquee.addEventListener('pointerdown',function(event){
      interacting=true;
      stopAuto();
      if(event.pointerType==='mouse'){
        dragging=true;
        startX=event.clientX;
        startScroll=marquee.scrollLeft;
        marquee.classList.add('is-dragging');
        try{marquee.setPointerCapture(event.pointerId);}catch(e){}
      }
    });

    marquee.addEventListener('pointermove',function(event){
      if(!dragging) return;
      marquee.scrollLeft=startScroll-(event.clientX-startX);
      normalize();
    });

    function endInteraction(){
      dragging=false;
      interacting=false;
      marquee.classList.remove('is-dragging');
      refreshAuto();
    }

    marquee.addEventListener('pointerup',endInteraction);
    marquee.addEventListener('pointercancel',endInteraction);
    marquee.addEventListener('touchend',function(){setTimeout(function(){interacting=false;refreshAuto();},350);},{passive:true});
    marquee.addEventListener('scroll',normalize,{passive:true});

    if(toggle){
      toggle.addEventListener('click',function(){manualPaused=!manualPaused;updateToggle();refreshAuto();});
    }

    if(reduceMotion.addEventListener){
      reduceMotion.addEventListener('change',function(){updateToggle();refreshAuto();});
    }

    document.addEventListener('visibilitychange',refreshAuto);
    updateToggle();

    var visibilityObserver=new IntersectionObserver(function(entries){
      visible=entries.some(function(entry){return entry.isIntersecting;});
      refreshAuto();
    },{rootMargin:'120px 0px'});
    visibilityObserver.observe(marquee);
    startAuto();
  }

  if('IntersectionObserver' in window){
    var activationObserver=new IntersectionObserver(function(entries,observer){
      if(entries.some(function(entry){return entry.isIntersecting;})){
        observer.disconnect();
        init();
      }
    },{rootMargin:'500px 0px'});
    activationObserver.observe(marquee);
  }else if('requestIdleCallback' in window){
    requestIdleCallback(init,{timeout:2500});
  }else{
    setTimeout(init,1200);
  }
})();

(function(){
  'use strict';

  var carousel=document.querySelector('.review-carousel');
  if(!carousel) return;
  var section=carousel.closest('.reviews-section');
  var head=section&&section.querySelector('.section-head');
  if(!head) return;

  var controls=document.createElement('div');
  controls.className='carousel-controls review-controls';
  controls.setAttribute('aria-label','Navegação das avaliações');
  controls.innerHTML='<button class="carousel-button" type="button" data-review-prev aria-label="Avaliação anterior">‹</button><button class="carousel-button" type="button" data-review-next aria-label="Próxima avaliação">›</button>';
  head.appendChild(controls);

  var prev=controls.querySelector('[data-review-prev]');
  var next=controls.querySelector('[data-review-next]');

  function step(){
    var card=carousel.querySelector('.review-card');
    if(!card) return carousel.clientWidth;
    var gap=parseFloat(getComputedStyle(carousel).gap)||0;
    return card.getBoundingClientRect().width+gap;
  }

  function maxScroll(){return Math.max(0,carousel.scrollWidth-carousel.clientWidth);}

  function update(){
    var max=maxScroll();
    var hasOverflow=max>3;
    controls.hidden=!hasOverflow;
    prev.disabled=!hasOverflow||carousel.scrollLeft<=2;
    next.disabled=!hasOverflow||carousel.scrollLeft>=max-2;
    prev.setAttribute('aria-disabled',prev.disabled?'true':'false');
    next.setAttribute('aria-disabled',next.disabled?'true':'false');
  }

  function move(direction){
    carousel.scrollBy({left:direction*step(),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  prev.addEventListener('click',function(){move(-1);});
  next.addEventListener('click',function(){move(1);});
  carousel.addEventListener('scroll',function(){window.requestAnimationFrame(update);},{passive:true});
  carousel.addEventListener('keydown',function(event){
    if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();move(1);}
  });
  window.addEventListener('resize',update,{passive:true});
  update();
})();
