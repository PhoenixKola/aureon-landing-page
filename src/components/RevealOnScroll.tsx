'use client';
import {useEffect} from 'react';

/** Progressive enhancement: content stays visible if JS/IntersectionObserver is unavailable.
 * Marks [data-reveal] blocks visible on entry and indexes their [data-reveal-item] children (--i) for staggering. */
export function RevealOnScroll() {
  useEffect(()=>{
    const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length || !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    nodes.forEach(node=>node.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((item,i)=>{
      if(!item.style.getPropertyValue('--i')) item.style.setProperty('--i',String(i));
    }));
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.09,rootMargin:'0px 0px -6% 0px'});
    nodes.forEach(node=>observer.observe(node));
    requestAnimationFrame(()=>document.documentElement.classList.add('reveal-enhanced'));
    return ()=>{
      observer.disconnect(); document.documentElement.classList.remove('reveal-enhanced');
    };
  },[]);
  return null;
}
