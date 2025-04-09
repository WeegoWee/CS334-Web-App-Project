(function ($) {
  "use strict";


  $(document).ready(function () {

    $('#btn-menu').click(function (e) {
      e.preventDefault();
      $('.sidebar-menu').toggleClass('open');
    })

    var swiper = new Swiper(".testimonial-swiper", {
      slidesPerView: 1,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    // init jarallax parallax
    var initJarallax = function () {
      jarallax(document.querySelectorAll(".jarallax"));

      jarallax(document.querySelectorAll(".jarallax-img"), {
        keepImg: true,
      });
    }

    var initGLightbox = function () {
      var lightbox = GLightbox();

      // lightbox.on('open', (target) => {
      //   console.log('lightbox opened');
      // });
      // var lightboxDescription = GLightbox({
      //   selector: '.glightbox2'
      // });
      // var lightboxVideo = GLightbox({
      //     selector: '.glightbox3'
      // });
      // lightboxVideo.on('slide_changed', ({ prev, current }) => {
      //     console.log('Prev slide', prev);
      //     console.log('Current slide', current);

      //     const { slideIndex, slideNode, slideConfig, player } = current;

      //     if (player) {
      //         if (!player.ready) {
      //             // If player is not ready
      //             player.on('ready', (event) => {
      //                 // Do something when video is ready
      //             });
      //         }

      //         player.on('play', (event) => {
      //             console.log('Started play');
      //         });

      //         player.on('volumechange', (event) => {
      //             console.log('Volume change');
      //         });

      //         player.on('ended', (event) => {
      //             console.log('Video ended');
      //         });
      //     }
      // });

    }


    // product single page
    var thumb_slider = new Swiper(".product-thumbnail-slider", {
      loop: true,
      slidesPerView: 3,
      autoplay: true,
      direction: "horizontal",
      spaceBetween: 15,
    });

    var large_slider = new Swiper(".product-large-slider", {
      loop: true,
      slidesPerView: 1,
      autoplay: true,
      effect: 'fade',
      thumbs: {
        swiper: thumb_slider,
      },
    });

    var swiper = new Swiper(".swiper-carousel", {
      slidesPerView: 4,
      spaceBetween: 30,
      navigation: {
        nextEl: '.swiper-carousel .swiper-next',
        prevEl: '.swiper-carousel .swiper-prev',
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        300: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    });

    var swiper = new Swiper(".swiper-slideshow", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 700,
      loop: true,
      navigation: {
        nextEl: '.swiper-slideshow .swiper-next',
        prevEl: '.swiper-slideshow .swiper-prev',
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    initJarallax();
    initQuantitySpinner();
    initSlider();
    initGLightbox();

    AOS.init({
      duration: 1200,
      once: true,
    })

    $('.navbar').on('click', '.search-toggle', function (e) {
      var selector = $(this).data('selector');

      $(selector).toggleClass('show').find('.search-input').focus();
      // $(selector).find('.autocomplete').focus();
      $(this).toggleClass('active');

      e.preventDefault();
    });

    // close when click off of container
    $(document).on('click touchstart', function (e) {
      if (!$(e.target).is('.search-toggle, .search-toggle *, .navbar, .navbar *')) {
        $('.search-toggle').removeClass('active');
        $('.navbar').removeClass('show');
      }
    });
    // End of a document

  })(jQuery);

}

)(jQuery);