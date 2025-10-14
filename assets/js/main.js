// Set current year
$(function(){
  $('#year').text(new Date().getFullYear());
});

// Mobile nav toggle
$(function(){
  $('.nav-toggle').on('click', function(){
    $('.nav').slideToggle(200);
  });
});

// jQuery smooth scrolling for in-page anchors (if used on any page)
$(function(){
  $('a[href^="#"]').on('click', function(e){
    const target = $(this).attr('href');
    if(target.length > 1 && $(target).length){
      e.preventDefault();
      $('html, body').animate({scrollTop: $(target).offset().top}, 600);
    }
  });
});

// Contact form demo handler (front-end only)
$(function(){
  $('#contactForm').on('submit', function(e){
    if(!this.checkValidity()){
      return; // native required validation
    }
    e.preventDefault();
    $('#formStatus').text('Sending...');

    // Simulate async send
    setTimeout(function(){
      $('#formStatus').text('Thanks! Your message has been sent.');
      $('#contactForm')[0].reset();
    }, 800);
  });
});

$(document).ready(function () {
  $(".nav-toggle").click(function () {
    $(".nav").toggleClass("active");
    $(this).find("i").toggleClass("fa-bars fa-xmark"); // Switch between bars and X
  });
});

