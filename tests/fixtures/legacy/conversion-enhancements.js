(function(){
  var script=document.currentScript;
  var siteRoot=script&&script.src?new URL('.',script.src):new URL('./',window.location.href);

  var services=[
    {slug:'geladeiras',name:'Geladeiras',image:'servico-geladeira.webp',mobile:'servico-geladeira-mobile.webp'},
    {slug:'maquinas-de-lavar',name:'Máquinas de lavar',image:'servico-lavadora.webp',mobile:'servico-lavadora-mobile.webp'},
    {slug:'fogoes',name:'Fogões',image:'servico-fogao.webp',mobile:'servico-fogao-mobile.webp'},
    {slug:'freezers',name:'Freezers',image:'servico-freezer.webp',mobile:'servico-freezer-mobile.webp'},
    {slug:'lava-loucas',name:'Lava-louças',image:'servico-lava-loucas.webp',mobile:'servico-lava-loucas-mobile.webp'},
    {slug:'lava-e-seca',name:'Lava e seca',image:'servico-lava-e-seca.webp',mobile:'servico-lava-e-seca-mobile.webp'},
    {slug:'fornos',name:'Fornos',image:'servico-forno.webp',mobile:'servico-forno-mobile.webp'},
    {slug:'micro-ondas',name:'Micro-ondas',image:'servico-microondas.webp',mobile:'servico-microondas-mobile.webp'}
  ];

  function serviceUrl(slug){return new URL('servicos/'+slug+'/',siteRoot).href;}
  function assetUrl(path){return new URL('assets/servicos/'+path,siteRoot).href;}

  function optimizeImages(){
    document.querySelectorAll('img').forEach(function(img){
      var isCritical=img.getAttribute('fetchpriority')==='high'||Boolean(img.closest('header'));
      if(!isCritical&&!img.hasAttribute('loading'))img.loading='lazy';
      if(!img.hasAttribute('decoding'))img.decoding='async';

      if((img.classList.contains('logo')||img.closest('.footer'))&&!img.hasAttribute('width')){
        img.setAttribute('width','205');
        img.setAttribute('height','74');
      }
    });
  }

  function currentService(){
    var path=window.location.pathname.replace(/\/+$/,'');
    return services.find(function(item){return path.endsWith('/servicos/'+item.slug);});
  }

  function addBreadcrumb(current){
    var copy=document.querySelector('.service-hero-copy');
    if(!copy||copy.querySelector('.service-breadcrumb'))return;
    var nav=document.createElement('nav');
    nav.className='service-breadcrumb';
    nav.setAttribute('aria-label','Navegação estrutural');
    nav.innerHTML='<a href="'+siteRoot.href+'">Início</a><span class="separator">›</span><a href="'+new URL('servicos/',siteRoot).href+'">Serviços</a><span class="separator">›</span><span aria-current="page">'+current.name+'</span>';
    copy.insertBefore(nav,copy.firstChild);
  }

  function relatedFor(current){
    var index=services.findIndex(function(item){return item.slug===current.slug;});
    var related=[];
    for(var step=1;related.length<3&&step<services.length;step++){
      related.push(services[(index+step)%services.length]);
    }
    return related;
  }

  function addRelated(current){
    var main=document.querySelector('main');
    if(!main||main.querySelector('.related-services'))return;

    var section=document.createElement('section');
    section.className='related-services';
    var related=relatedFor(current);
    var cards=related.map(function(item){
      return '<a class="related-service-card" data-related-service="'+item.slug+'" href="'+serviceUrl(item.slug)+'">'+
        '<picture><source media="(max-width:680px)" srcset="'+assetUrl('mobile/'+item.mobile)+'">'+
        '<img src="'+assetUrl(item.image)+'" width="1254" height="1254" alt="'+item.name+'" loading="lazy" decoding="async"></picture>'+
        '<div class="related-service-copy"><strong>'+item.name+'</strong><span>Ver assistência →</span></div></a>';
    }).join('');

    section.innerHTML='<div class="container"><div class="related-services-head"><div><span class="kicker">Outros equipamentos</span><h2>Veja também outros serviços da D’orus</h2></div><a href="'+new URL('servicos/',siteRoot).href+'">Ver todos os serviços →</a></div><div class="related-service-grid">'+cards+'</div></div>';

    section.querySelectorAll('[data-related-service]').forEach(function(link){
      link.addEventListener('click',function(){
        if(window.dorusAnalytics){
          window.dorusAnalytics.track('select_related_service',{
            service_origin:current.slug,
            service_destination:link.getAttribute('data-related-service'),
            cta_location:'related_services'
          });
        }
      });
    });

    var cta=main.querySelector('.section.section-soft:last-of-type');
    if(cta)main.insertBefore(section,cta);else main.appendChild(section);
  }

  optimizeImages();

  var current=currentService();
  if(current){
    addBreadcrumb(current);
    addRelated(current);
  }
})();
