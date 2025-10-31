<script>
(function() {
  // Get stored language preference or default to English
  const storedLang = localStorage.getItem('matchona-language') || 'en';
  
  // Set initial language class on html element
  if (storedLang === 'ny') {
    document.documentElement.classList.add('lang-ny');
  }

  // Language toggle function - can be called from anywhere
  window.setLanguage = function(lang) {
    const html = document.documentElement;
    
    // Toggle the class on html element
    if (lang === 'ny') {
      html.classList.add('lang-ny');
    } else {
      html.classList.remove('lang-ny');
    }
    
    // Save preference
    localStorage.setItem('matchona-language', lang);
    
    // Update all toggle buttons
    updateToggleButtons(lang);
  };

  // Update toggle button active states
  function updateToggleButtons(lang) {
    // Update buttons with data-lang-toggle attribute
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelectorAll('[data-lang-toggle="' + lang + '"]').forEach(btn => {
      btn.classList.add('active');
    });
  }

  // Initialize toggle buttons on page load
  document.addEventListener('DOMContentLoaded', function() {
    updateToggleButtons(storedLang);
  });
})();
</script>