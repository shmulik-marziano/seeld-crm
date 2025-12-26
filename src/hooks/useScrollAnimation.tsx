import { useEffect, useRef, useState } from 'react';

export type AnimationType = 
  | 'fade-in-up' 
  | 'slide-from-left' 
  | 'slide-from-right' 
  | 'scale-in' 
  | 'zoom-in' 
  | 'rotate-in'
  | 'fade-in'
  | 'slide-up';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationType?: AnimationType;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    animationType = 'fade-in-up',
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  const animationClass = isVisible ? `animate-${animationType}` : '';

  return { elementRef, isVisible, animationClass };
};
