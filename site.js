(function () {
  var script = document.currentScript;
  var siteRoot = script && script.src ? new URL('.', script.src) : new URL('./', window.location.href);
  var assetVersion = '20260829-uxhotfix';

  function hasLoadedAsset(selector, fileName) {
    return Array.from(document.querySelectorAll(selector)).some(function (node) {
      var raw = node.getAttribute(selector === 'link[rel="stylesheet"]' ? 'href' : 'src') || '';
      try {
        return new URL(raw, window.location.href).pathname.endsWith('/' + fileName) || new URL(raw, window.location.href).pathname.endsWith(fileName);
      } catch (e) {
        return raw.split('?')[0].endsWith(fileName);
      }
    });
  }

  function ensureStylesheet(fileName) {
    if (hasLoadedAsset('link[rel="stylesheet"]', fileName)) return;
    var href = new URL(fileName + '?v=' + assetVersion, siteRoot).href;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureScript(fileName) {
    if (hasLoadedAsset('script[src]', fileName)) return;
    var src = new URL(fileName + '?v=' + assetVersion, siteRoot).href;
    var extraScript = document.createElement('script');
    extraScript.src = src;
    extraScript.defer = true;
    document.head.appendChild(extraScript);
  }

  if (!hasLoadedAsset('link[rel="stylesheet"]', 'site.css')) {
    ensureStylesheet('accessibility.css');
    ensureStylesheet('accessibility-contrast.css');
    ensureStylesheet('layout.css');
    ensureStylesheet('usability.css');
    ensureStylesheet('conversion-enhancements.css');
    ensureStylesheet('privacy.css');
  }
  ensureScript('analytics.js');
  ensureScript('conversion-enhancements.js');
  ensureScript('accessibility-tools.js');
  ensureScript('privacy-consent.js');

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.querySelector('main');
    if (main && !main.id) main.id = 'conteudo';

    if (main && !document.querySelector('.skip-link')) {
      var skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#conteudo';
      skip.textContent = 'Pular para o conteúdo';
      document.body.insertBefore(skip, document.body.firstChild);
    }

    var footerInstagramIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
    var footerWhatsappIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.09.55 4.13 1.58 5.93L0 24l6.35-1.67a11.9 11.9 0 0 0 5.72 1.46h.01C18.66 23.79 24 18.45 24 11.88c0-3.18-1.24-6.16-3.48-8.4Zm-8.44 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.86 9.86 0 0 1-1.51-5.24C2.16 6.43 6.59 2 12.07 2c2.64 0 5.12 1.03 6.98 2.89a9.78 9.78 0 0 1 2.89 6.98c0 5.48-4.44 9.91-9.92 9.91Zm5.44-7.44c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.13 3.26 5.16 4.57.72.31 1.28.49 1.72.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.31.18-1.43-.08-.13-.28-.2-.58-.35Z"/></svg>';
    var footer = document.querySelector('.footer');
    if (footer) {
      var footerUrl = function (path) { return new URL(path, siteRoot).href; };
      footer.innerHTML = [
        '<div class="container footer-grid footer-grid-professional">',
          '<div class="footer-company">',
            '<a class="footer-brand" href="' + footerUrl('./') + '" aria-label="D’orus Assistência Técnica - início">',
              '<img src="' + footerUrl('assets/dorus-logo-3d.webp') + '" alt="D’orus Assistência Técnica" loading="lazy" decoding="async">',
            '</a>',
            '<p>Assistência técnica de linha branca com atendimento em domicílio em Guarulhos e região.</p>',
            '<p class="footer-company-data"><strong>D’orus Assistência Técnica</strong><span data-company-document>CNPJ 30.204.892/0001-03</span><span>Garantia mínima de 90 dias nos serviços executados</span></p>',
          '</div>',
          '<div class="footer-links">',
            '<h3>Atendimento</h3>',
            '<a href="' + footerUrl('agendamento/') + '">Agendar uma visita</a>',
            '<a href="' + footerUrl('fale-conosco/') + '">Fale conosco</a>',
            '<a href="tel:+5511913573932">(11) 91357-3932</a>',
            '<span>Guarulhos, Arujá, Itaquaquecetuba e São Paulo</span>',
          '</div>',
          '<div class="footer-links">',
            '<h3>Institucional</h3>',
            '<a href="' + footerUrl('sobre/') + '">Sobre a D’orus</a>',
            '<a href="' + footerUrl('servicos/') + '">Serviços</a>',
            '<a href="' + footerUrl('curiosidades/') + '">Guias</a>',
            '<a href="' + footerUrl('privacidade/') + '">Política de privacidade</a>',
          '</div>',
          '<div class="footer-social">',
            '<h3>Acompanhe e fale conosco</h3>',
            '<div class="footer-social-links">',
              '<a href="https://instagram.com/assistenciadorus" target="_blank" rel="noopener noreferrer" aria-label="Instagram da D’orus"><span class="footer-social-icon footer-social-icon-instagram">' + footerInstagramIcon + '</span> Instagram</a>',
              '<a href="https://wa.me/5511913573932" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da D’orus"><span class="footer-social-icon footer-social-icon-whatsapp">' + footerWhatsappIcon + '</span> WhatsApp</a>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="container footer-bottom">',
          '<span>© D’orus Assistência Técnica</span>',
          '<span>Desenvolvido por Kauan Cardim</span>',
        '</div>'
      ].join('');
    }

    var pagePath = window.location.pathname.replace(/\/+$/, '') || '/';
    var overviewPaths = ['/sobre', '/servicos', '/curiosidades'];
    if (overviewPaths.indexOf(pagePath) !== -1) {
      var overviewHero = document.querySelector('.internal');
      if (overviewHero) overviewHero.classList.add('overview-hero');
    }

    if (pagePath === '/sobre') {
      var valuesGrid = document.querySelector('.values');
      var valuesSection = valuesGrid && valuesGrid.closest('.section');
      var storySection = document.querySelector('.content-grid');
      storySection = storySection && storySection.closest('.section');
      if (valuesSection && storySection) {
        valuesSection.classList.add('about-values');
        storySection.parentNode.insertBefore(valuesSection, storySection);
      }
    }

    if (pagePath === '/servicos') {
      var serviceHeroContainer = document.querySelector('.internal > .container');
      if (serviceHeroContainer && !serviceHeroContainer.querySelector('.service-warranty')) {
        var warranty = document.createElement('p');
        warranty.className = 'service-warranty';
        warranty.innerHTML = '<strong>Garantia mínima de 90 dias</strong> nos serviços executados, conforme as condições da ordem de serviço.';
        serviceHeroContainer.appendChild(warranty);
      }
      var serviceCapture = document.querySelector('.cta-panel');
      if (serviceCapture) {
        serviceCapture.classList.add('service-cta-professional');
        serviceCapture.innerHTML = [
          '<div class="service-cta-copy">',
            '<span class="kicker">Atendimento sob consulta</span>',
            '<h2>Não encontrou seu equipamento?</h2>',
            '<p>Envie marca, modelo e uma descrição do defeito. A equipe confirma a possibilidade de atendimento antes da visita.</p>',
            '<div class="service-cta-trust"><span>Atendimento em domicílio</span><span>Garantia mínima de 90 dias</span></div>',
          '</div>',
          '<div class="actions service-cta-actions">',
            '<a class="button button-white" href="' + new URL('agendamento/', siteRoot).href + '">Agendar visita</a>',
            '<a class="button button-green" href="https://wa.me/5511913573932?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20o%20atendimento%20para%20outro%20equipamento." target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>',
          '</div>'
        ].join('');
        var serviceCaptureSection = serviceCapture.closest('.section');
        if (serviceCaptureSection) serviceCaptureSection.classList.add('service-capture');
      }
    }

    if (pagePath.indexOf('/servicos/') === 0 && pagePath !== '/servicos/') {
      var serviceDetailCopy = document.querySelector('.service-hero-copy');
      var detailEquipmentNode = document.querySelector('.service-hero-copy .eyebrow');
      var detailEquipmentText = detailEquipmentNode ? detailEquipmentNode.textContent.trim() : 'seu equipamento';
      var detailEquipmentLabel = detailEquipmentText.toLowerCase();
      var detailHeroMessage = encodeURIComponent('Olá, gostaria de solicitar atendimento para ' + detailEquipmentLabel + '.');
      if (serviceDetailCopy) {
        serviceDetailCopy.classList.add('service-hero-copy-centered');
        var detailHeroActions = serviceDetailCopy.querySelector('.actions');
        if (!detailHeroActions) {
          detailHeroActions = document.createElement('div');
          detailHeroActions.className = 'actions';
          serviceDetailCopy.appendChild(detailHeroActions);
        }
        var detailHeroWhatsapp = detailHeroActions.querySelector('a[href*="wa.me/"]');
        if (!detailHeroWhatsapp) {
          detailHeroWhatsapp = document.createElement('a');
          detailHeroActions.appendChild(detailHeroWhatsapp);
        }
        detailHeroWhatsapp.className = 'button button-green';
        detailHeroWhatsapp.href = 'https://wa.me/5511913573932?text=' + detailHeroMessage;
        detailHeroWhatsapp.target = '_blank';
        detailHeroWhatsapp.rel = 'noopener noreferrer';
        detailHeroWhatsapp.textContent = 'Fale conosco';
      }
      if (serviceDetailCopy && !serviceDetailCopy.querySelector('.service-warranty')) {
        var detailWarranty = document.createElement('p');
        detailWarranty.className = 'service-warranty service-warranty-detail';
        detailWarranty.innerHTML = '<strong>Garantia mínima de 90 dias</strong> nos serviços executados, conforme a ordem de serviço.';
        serviceDetailCopy.appendChild(detailWarranty);
      }

      var detailCapture = document.querySelector('.cta-panel');
      if (detailCapture) {
        var detailCaptureTitle = detailCapture.querySelector('h2');
        var equipmentLabel = detailEquipmentLabel;
        var detailMessage = encodeURIComponent('Olá, gostaria de solicitar atendimento para ' + equipmentLabel + '.');
        detailCapture.classList.add('service-detail-cta-professional');
        detailCapture.innerHTML = [
          '<div class="service-detail-cta-copy">',
            '<span class="kicker">Atendimento para ' + equipmentLabel + '</span>',
            '<h2>' + (detailCaptureTitle ? detailCaptureTitle.textContent.trim() : 'Conte o problema do seu equipamento.') + '</h2>',
            '<p>Informe marca, modelo e o sintoma do aparelho. A equipe orienta o próximo passo antes da visita.</p>',
            '<div class="service-detail-cta-trust"><span>Atendimento em domicílio</span><span>Garantia mínima de 90 dias</span></div>',
          '</div>',
          '<div class="actions service-detail-cta-actions">',
            '<a class="button button-white" href="' + new URL('agendamento/', siteRoot).href + '">Ver horários</a>',
            '<a class="button button-green" href="https://wa.me/5511913573932?text=' + detailMessage + '" target="_blank" rel="noopener noreferrer">Enviar pelo WhatsApp</a>',
          '</div>'
        ].join('');
      }

      document.querySelectorAll('main .section-soft').forEach(function (section) {
        var relatedGuideCards = section.querySelectorAll('.card');
        if (!relatedGuideCards.length) return;
        section.classList.add('service-related-guides');
        if (relatedGuideCards.length === 1) section.classList.add('is-single');
      });
    }

    if (pagePath.indexOf('/curiosidades/') === 0 && pagePath !== '/curiosidades/') {
      document.body.classList.add('guide-detail-page');

      var guideHeroContainer = document.querySelector('.internal > .container');
      if (guideHeroContainer) guideHeroContainer.classList.add('guide-hero-centered');

      var guideCapture = document.querySelector('.cta-panel');
      if (guideCapture) {
        var guideTitle = document.querySelector('.internal h1');
        var guideCaptureTitle = guideCapture.querySelector('h2');
        var guideCaptureText = guideCapture.querySelector('p');
        var guideServiceLink = guideCapture.querySelector('a:not([href*="wa.me/"])');
        var guideWhatsappLink = guideCapture.querySelector('a[href*="wa.me/"]');
        var guideMessage = encodeURIComponent('Olá, li o guia "' + (guideTitle ? guideTitle.textContent.trim() : 'da D’orus') + '" e gostaria de atendimento.');

        guideCapture.classList.add('guide-detail-cta-professional');
        guideCapture.innerHTML = [
          '<div class="guide-detail-cta-copy">',
            '<span class="kicker">Orientação e assistência</span>',
            '<h2>' + (guideCaptureTitle ? guideCaptureTitle.textContent.trim() : 'Precisa de ajuda com seu eletrodoméstico?') + '</h2>',
            '<p>' + (guideCaptureText ? guideCaptureText.textContent.trim() : 'Conte o sintoma para a equipe e receba orientação sobre o próximo passo.') + '</p>',
            '<div class="guide-detail-cta-trust"><span>Atendimento em domicílio</span><span>Garantia mínima de 90 dias</span></div>',
          '</div>',
          '<div class="actions guide-detail-cta-actions">',
            guideServiceLink ? '<a class="button button-white" href="' + guideServiceLink.href + '">' + guideServiceLink.textContent.trim() + '</a>' : '',
            '<a class="button button-green" href="https://wa.me/5511913573932?text=' + guideMessage + '" target="_blank" rel="noopener noreferrer">Fale conosco</a>',
          '</div>'
        ].join('');
      }
    }

    function addPageClosingCta(config) {
      var main = document.querySelector('main');
      if (!main || main.querySelector('.page-closing-cta')) return;
      var section = document.createElement('section');
      section.className = 'section page-closing-cta-section';
      section.innerHTML = [
        '<div class="container page-closing-cta">',
          '<div class="page-closing-cta-copy">',
            '<span class="kicker">' + config.kicker + '</span>',
            '<h2>' + config.title + '</h2>',
            '<p>' + config.text + '</p>',
            '<div class="page-closing-cta-trust"><span>Atendimento em domicílio</span><span>Garantia mínima de 90 dias</span></div>',
          '</div>',
          '<div class="actions page-closing-cta-actions">',
            '<a class="button button-white" href="' + new URL(config.secondaryPath, siteRoot).href + '">' + config.secondaryLabel + '</a>',
            '<a class="button button-green" href="https://wa.me/5511913573932?text=' + encodeURIComponent(config.whatsappText) + '" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>',
          '</div>',
        '</div>'
      ].join('');
      main.appendChild(section);
    }

    if (pagePath === '/sobre') {
      addPageClosingCta({
        kicker: 'Atendimento em domicílio',
        title: 'Precisa de assistência para seu eletrodoméstico?',
        text: 'Conte o que está acontecendo e a equipe orienta o melhor próximo passo para o atendimento.',
        secondaryPath: 'agendamento/',
        secondaryLabel: 'Agendar visita',
        whatsappText: 'Olá, conheci a D’orus pelo site e gostaria de solicitar atendimento.'
      });
    }

    if (pagePath === '/curiosidades') {
      addPageClosingCta({
        kicker: 'Precisa de assistência?',
        title: 'Identificou algum desses sinais no seu aparelho?',
        text: 'Evite desmontar o equipamento. Envie o sintoma, a marca e o modelo para a equipe avaliar o atendimento.',
        secondaryPath: 'servicos/',
        secondaryLabel: 'Ver serviços',
        whatsappText: 'Olá, li um guia no site da D’orus e gostaria de ajuda com meu eletrodoméstico.'
      });
    }

    function addJourneySwitch(currentPage) {
      var heroContainer = document.querySelector('.internal > .container');
      if (!heroContainer || heroContainer.querySelector('.journey-switch')) return;
      var journeyHero = heroContainer.closest('.internal');
      if (journeyHero) journeyHero.classList.add('journey-hero-centered');
      var switcher = document.createElement('nav');
      switcher.className = 'journey-switch';
      switcher.setAttribute('aria-label', 'Escolha como deseja falar com a D’orus');
      var scheduleItem = currentPage === 'schedule'
        ? '<span aria-current="page">Escolher data <small>Solicitar uma visita técnica</small></span>'
        : '<a href="' + new URL('agendamento/', siteRoot).href + '">Escolher data <small>Solicitar uma visita técnica</small></a>';
      var contactItem = currentPage === 'contact'
        ? '<span aria-current="page">Falar com a equipe <small>Tirar dúvidas e explicar o problema</small></span>'
        : '<a href="' + new URL('fale-conosco/', siteRoot).href + '">Falar com a equipe <small>Tirar dúvidas e explicar o problema</small></a>';
      switcher.innerHTML = scheduleItem + contactItem;
      heroContainer.appendChild(switcher);
    }

    if (pagePath === '/agendamento') {
      addJourneySwitch('schedule');
      var scheduleTitle = document.querySelector('.internal h1');
      var scheduleLead = document.querySelector('.internal p');
      if (scheduleTitle) scheduleTitle.textContent = 'Escolha a data e o período para solicitar uma visita.';
      if (scheduleLead) scheduleLead.textContent = 'Selecione manhã, tarde ou dia inteiro. Cada período aceita até 5 clientes; o horário exato é confirmado pelo WhatsApp.';
    }

    if (pagePath === '/fale-conosco') {
      addJourneySwitch('contact');
      var contactTitle = document.querySelector('.internal h1');
      var contactLead = document.querySelector('.internal p');
      if (contactTitle) contactTitle.textContent = 'Tire dúvidas ou descreva o problema pelo WhatsApp.';
      if (contactLead) contactLead.textContent = 'Use esta página para conversar primeiro com a equipe, sem precisar escolher uma data.';
    }

    var localLogo = new URL('assets/dorus-logo-3d.webp?v=' + assetVersion, siteRoot).href;
    document.querySelectorAll('img.logo, .footer img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (src.includes('dorus-menu-digital') || src.includes('dorus-logo')) {
        img.src = localLogo;
        img.loading = img.closest('header') ? 'eager' : 'lazy';
        img.decoding = 'async';
      }
    });

    var whatsappHref = 'https://wa.me/5511913573932?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20D%27orus%20e%20gostaria%20de%20atendimento.';
    var whatsappIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.09.55 4.13 1.58 5.93L0 24l6.35-1.67a11.9 11.9 0 0 0 5.72 1.46h.01C18.66 23.79 24 18.45 24 11.88c0-3.18-1.24-6.16-3.48-8.4Zm-8.44 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.86 9.86 0 0 1-1.51-5.24C2.16 6.43 6.59 2 12.07 2c2.64 0 5.12 1.03 6.98 2.89a9.78 9.78 0 0 1 2.89 6.98c0 5.48-4.44 9.91-9.92 9.91Zm5.44-7.44c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.13 3.26 5.16 4.57.72.31 1.28.49 1.72.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.31.18-1.43-.08-.13-.28-.2-.58-.35Z"/></svg>';

    var floatButton = document.querySelector('.whatsapp-float');
    if (!floatButton) {
      floatButton = document.createElement('a');
      floatButton.className = 'whatsapp-float';
      document.body.appendChild(floatButton);
    }
    floatButton.href = whatsappHref;
    floatButton.target = '_blank';
    floatButton.rel = 'noopener noreferrer';
    floatButton.setAttribute('aria-label', 'Falar com a D’orus pelo WhatsApp');
    floatButton.setAttribute('title', 'Falar com a D’orus pelo WhatsApp');
    floatButton.innerHTML = whatsappIcon;

    if (!document.querySelector('.whatsapp-tooltip')) {
      var tooltip = document.createElement('div');
      tooltip.className = 'whatsapp-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.textContent = 'Fale com a D’orus';
      document.body.insertBefore(tooltip, floatButton);
    }

    document.querySelectorAll('.whatsapp-mini').forEach(function (link) {
      link.href = whatsappHref;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        var details = link.closest('details');
        if (details) details.removeAttribute('open');
      });
    });

    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });

    var scheduleForm = document.querySelector('[data-schedule-form]');
    if (scheduleForm) {
      var dateInput = scheduleForm.querySelector('input[name="data"]');
      var periodSelect = scheduleForm.querySelector('select[name="periodo"]');
      var status = scheduleForm.querySelector('[data-schedule-status]');
      var calendarLink = scheduleForm.querySelector('[data-calendar-link]');
      var scheduleKicker = scheduleForm.querySelector('.form-heading .kicker');
      var scheduleDisclaimer = scheduleForm.querySelector('.schedule-disclaimer');
      var scheduleSteps = document.querySelectorAll('.schedule-steps > div > span');
      if (scheduleKicker) scheduleKicker.textContent = 'Solicitar atendimento';
      if (scheduleDisclaimer) scheduleDisclaimer.textContent = 'A data e o período são uma solicitação. O horário exato da visita é confirmado pela equipe da D’orus no WhatsApp.';
      if (scheduleSteps[0]) scheduleSteps[0].textContent = 'Escolha a data e o período: manhã, tarde ou dia inteiro.';
      if (scheduleSteps[2]) scheduleSteps[2].textContent = 'A D’orus confirma o horário exato pelo WhatsApp.';
      if (periodSelect) {
        periodSelect.innerHTML = [
          '<option value="">Selecione</option>',
          '<option value="manha">Manhã - 8h às 13h</option>',
          '<option value="tarde">Tarde - 13h às 18h</option>',
          '<option value="integral">Dia inteiro - 8h às 18h</option>'
        ].join('');
      }
      var today = new Date();
      var localTodayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var maxScheduleDate = new Date(localTodayDate.getTime());
      maxScheduleDate.setDate(maxScheduleDate.getDate() + 60);

      function dateValue(date) {
        var local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
      }

      function validateScheduleDate() {
        if (!dateInput || !dateInput.value) return true;
        var parts = dateInput.value.split('-').map(Number);
        var selected = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
        var message = '';
        if (!selected || Number.isNaN(selected.getTime())) message = 'Escolha uma data válida.';
        else if (selected.getDay() === 0) message = 'A D’orus não atende aos domingos. Escolha uma data de segunda a sábado.';
        dateInput.setCustomValidity(message);
        return !message;
      }

      if (dateInput) {
        dateInput.min = dateValue(localTodayDate);
        dateInput.max = dateValue(maxScheduleDate);
        dateInput.addEventListener('change', validateScheduleDate);
        dateInput.addEventListener('input', validateScheduleDate);
      }

      function fieldValue(data, name) { return String(data.get(name) || '').trim(); }
      function displayDate(value) { var parts = value.split('-'); return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : value; }
      function calendarDates(date, period) {
        var periodHours = {
          'manha': ['080000', '130000'],
          'tarde': ['130000', '180000'],
          'integral': ['080000', '180000']
        };
        var hours = periodHours[period] || periodHours.manha;
        var compactDate = date.replace(/-/g, '');
        return compactDate + 'T' + hours[0] + '/' + compactDate + 'T' + hours[1];
      }

      scheduleForm.addEventListener('submit', function (event) {
        event.preventDefault();
        validateScheduleDate();
        if (!scheduleForm.reportValidity()) return;
        var data = new FormData(scheduleForm);
        var periodLabel = periodSelect.options[periodSelect.selectedIndex].text;
        var message = [
          'Olá, vim pelo site da D’orus e gostaria de solicitar uma visita técnica.', '',
          '*Nome:* ' + fieldValue(data, 'nome'),
          '*Meu WhatsApp:* ' + fieldValue(data, 'telefone'),
          '*Bairro:* ' + fieldValue(data, 'bairro'),
          '*Endereço:* ' + fieldValue(data, 'endereco'),
          '*Equipamento:* ' + fieldValue(data, 'equipamento'),
          '*Marca/modelo:* ' + (fieldValue(data, 'marca') || 'Não informado'),
          '*Problema:* ' + fieldValue(data, 'problema'),
          '*Data solicitada:* ' + displayDate(fieldValue(data, 'data')),
          '*Período solicitado:* ' + periodLabel,
          '*Horário exato:* a confirmar pela equipe dentro do período escolhido.', '',
          'Por favor, confirme o horário da visita pelo WhatsApp.'
        ].join('\n');

        var whatsappUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(message);
        var calendarDetails = 'Solicitação enviada à D’orus Assistência Técnica. Horário exato aguardando confirmação pelo WhatsApp.\nPeríodo solicitado: ' + periodLabel + '\nEquipamento: ' + fieldValue(data, 'equipamento') + '\nProblema: ' + fieldValue(data, 'problema');
        var calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
          '&text=' + encodeURIComponent('Solicitação D’orus — aguardando confirmação') +
          '&dates=' + encodeURIComponent(calendarDates(fieldValue(data, 'data'), fieldValue(data, 'periodo'))) +
          '&ctz=America%2FSao_Paulo' +
          '&details=' + encodeURIComponent(calendarDetails) +
          '&location=' + encodeURIComponent(fieldValue(data, 'endereco') + ', ' + fieldValue(data, 'bairro') + ', Guarulhos - SP');

        calendarLink.href = calendarUrl;
        calendarLink.hidden = false;
        status.hidden = false;
        if (window.dorusAnalytics) {
          window.dorusAnalytics.trackLead('schedule_whatsapp', {
            equipment: fieldValue(data, 'equipamento'),
            schedule_period: fieldValue(data, 'periodo'),
            cta_location: 'schedule_form'
          });
        }
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    }
  });
})();
