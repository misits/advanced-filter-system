/**
 * @fileoverview Animation management for AFS
 */

export class Animation {
    constructor(afs) {
        this.afs = afs;
        this.options = this.afs.options;
        this.animations = {
          fade: {
            in: { opacity: 1, transform: 'scale(1)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'scale(0.95)', transitionTimingFunction: 'ease-out' },
          },
          slide: {
            in: { opacity: 1, transform: 'translateY(0)', transitionTimingFunction: 'ease-in-out' },
            out: { opacity: 0, transform: 'translateY(20px)', transitionTimingFunction: 'ease-in-out' },
          },
          scale: {
            in: { opacity: 1, transform: 'scale(1)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'scale(0.8)', transitionTimingFunction: 'ease-out' },
          },
          rotate: {
            in: { opacity: 1, transform: 'rotate(0deg) scale(1)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'rotate(90deg) scale(0.9)', transitionTimingFunction: 'ease-out' },
          },
          flip: {
            in: { opacity: 1, transform: 'rotateY(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'rotateY(180deg)', transitionTimingFunction: 'ease-out' },
          },
          zoom: {
            in: { opacity: 1, transform: 'scale(1.2)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'scale(0.8)', transitionTimingFunction: 'ease-out' },
          },
          bounce: {
            in: { opacity: 1, transform: 'translateY(0)', animation: 'bounce 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
            out: { opacity: 0, transform: 'translateY(-20px)', animation: 'bounceOut 1s ease-out' },
          },
          blur: {
            in: { opacity: 1, filter: 'blur(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, filter: 'blur(5px)', transitionTimingFunction: 'ease-out' },
          },
          skew: {
            in: { opacity: 1, transform: 'skew(0deg)', transitionTimingFunction: 'ease-in-out' },
            out: { opacity: 0, transform: 'skew(10deg)', transitionTimingFunction: 'ease-in-out' },
          },
          slideInLeft: {
            in: { opacity: 1, transform: 'translateX(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'translateX(-100%)', transitionTimingFunction: 'ease-out' },
          },
          slideInRight: {
            in: { opacity: 1, transform: 'translateX(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'translateX(100%)', transitionTimingFunction: 'ease-out' },
          },
          fadeInUp: {
            in: { opacity: 1, transform: 'translateY(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'translateY(10px)', transitionTimingFunction: 'ease-out' },
          },
          fadeInDown: {
            in: { opacity: 1, transform: 'translateY(0)', transitionTimingFunction: 'ease-in' },
            out: { opacity: 0, transform: 'translateY(-10px)', transitionTimingFunction: 'ease-out' },
          },
          bounceIn: {
            in: { opacity: 1, transform: 'scale(1.05)', transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
            out: { opacity: 0, transform: 'scale(0.9)', transitionTimingFunction: 'ease-out' },
          },
        };
      }
      
    applyShowAnimation(item, animationType = 'fade') {
    const duration = this.options.get('animation.duration') || '300ms';
    const animation = this.animations[animationType]?.in || this.animations.fade.in;
    
    // Ensure display is set
    item.style.display = 'block';
    item.style.opacity = '0'; // Start with opacity 0
    
    // Apply animation in next frame
    requestAnimationFrame(() => {
      Object.assign(item.style, animation, {
        transition: `opacity ${duration} ${animation.transitionTimingFunction}, transform ${duration} ${animation.transitionTimingFunction}`,
      });
    });
  }
  
    applyHideAnimation(item, animationType = 'fade') {
      const duration = this.options.get('animation.duration') || '300ms';
      const animation = this.animations[animationType]?.out || this.animations.fade.out;
      
      Object.assign(item.style, animation, {
        transition: `opacity ${duration} ${animation.transitionTimingFunction}, transform ${duration} ${animation.transitionTimingFunction}`,
      });

      const handleTransitionEnd = () => {
        item.style.display = 'none';
        item.removeEventListener('transitionend', handleTransitionEnd);
      };
      item.addEventListener('transitionend', handleTransitionEnd);
    }

    setAnimation(animationType) {
      this.afs.options.set('animation.type', animationType);
    }
}