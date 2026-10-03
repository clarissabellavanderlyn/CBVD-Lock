export function initPerformance(){
  document.documentElement.classList.add('performance-ready');
  document.querySelectorAll('img:not([loading])').forEach(img=>{if(!img.closest('.hero'))img.loading='lazy';img.decoding='async';});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{rootMargin:'80px'});document.querySelectorAll('.section-shell,.dashboard-stat,.timeline-item').forEach(el=>io.observe(el));}
}
