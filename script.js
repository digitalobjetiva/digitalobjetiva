/* 
  Digital Objetiva - Interactivity & Animations 1.0
  Scroll Effects | Intersection Observer | Form Handling
*/

document.addEventListener('DOMContentLoaded', () => {
    
    /* --- Show Menu Mobile --- */
    const navMenu = document.getElementById('nav-menu'),
          navToggle = document.getElementById('nav-toggle'),
          navLinks = document.querySelectorAll('.nav_link');

    if(navToggle){
        navToggle.addEventListener('click', () =>{
            navMenu.classList.toggle('show-menu');
        });
    }

    // Fechar menu ao clicar em um link
    navLinks.forEach(n => n.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    }));


    /* --- Scroll Header Background --- */
    function scrollHeader(){
        const header = document.getElementById('header');
        // Quando o scroll for maior que 50px de altura, adiciona a classe scroll-header
        if(this.scrollY >= 50) header.classList.add('scroll-header'); else header.classList.remove('scroll-header');
    }
    window.addEventListener('scroll', scrollHeader);


    /* --- Active Link Highlighting --- */
    const sections = document.querySelectorAll('section[id]');

    function scrollActive(){
        const scrollY = window.pageYOffset;

        sections.forEach(current =>{
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');

            if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
                document.querySelector('.nav_menu a[href*=' + sectionId + ']')?.classList.add('active');
            }else{
                document.querySelector('.nav_menu a[href*=' + sectionId + ']')?.classList.remove('active');
            }
        });
    }
    window.addEventListener('scroll', scrollActive);

    /* --- Scroll Up --- */
    function scrollUp(){
        const scrollUp = document.getElementById('scroll-up');
        if(this.scrollY >= 200) {
            scrollUp?.classList.add('show-scroll');
        } else {
            scrollUp?.classList.remove('show-scroll');
        }
    }
    window.addEventListener('scroll', scrollUp);


    /* --- Scroll Reveal Animations --- */
    // Adiciona classe de revelação aos elementos
    const revealElements = [
        '.hero_data', '.hero_img', 
        '.sobre_text', '.sobre_card-grid',
        '.servico-card', '.section-title_container',
        '.highlight_data', '.highlight_preview',
        '.info-item', '.suporte_container',
        '.social_card', '.contato_info', '.contato_form'
    ];

    revealElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.classList.add('sr-reveal'));
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: parar de observar após revelar
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.sr-reveal').forEach(el => revealObserver.observe(el));


    /* --- Form Submission to WhatsApp --- */
    const contatoForm = document.querySelector('.contato_form');
    if (contatoForm) {
        contatoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = contatoForm.querySelector('input[type="text"]').value;
            const email = contatoForm.querySelector('input[type="email"]').value;
            const mensagem = contatoForm.querySelector('textarea').value;
            
            const textoWhastApp = `Olá! Meu nome é ${nome} (${email}). Estou vindo do site da Digital Objetiva e gostaria de suporte com o seguinte:\n\n${mensagem}`;
            
            const encodedText = encodeURIComponent(textoWhastApp);
            const waUrl = `https://wa.me/5521970707616?text=${encodedText}`;
            
            window.open(waUrl, '_blank');
        });
    }

    /* --- Remove Loading Class --- */
    window.onload = () => {
        document.body.classList.remove('js-loading');
    };

});
