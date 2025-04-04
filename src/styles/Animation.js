/**
 * @fileoverview Animation management for AFS
 */

export class Animation {
  constructor(afs) {
    this.afs = afs;
    this.options = this.afs.options;
    this.animations = {
      fade: {
        in: {
          opacity: 1,
          transform: "scale(1)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "scale(0.95)",
          transitionTimingFunction: "ease-out",
        },
      },
      slide: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in-out",
        },
        out: {
          opacity: 0,
          transform: "translateY(20px)",
          transitionTimingFunction: "ease-in-out",
        },
      },
      scale: {
        in: {
          opacity: 1,
          transform: "scale(1)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "scale(0.8)",
          transitionTimingFunction: "ease-out",
        },
      },
      rotate: {
        in: {
          opacity: 1,
          transform: "rotate(0deg) scale(1)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "rotate(90deg) scale(0.9)",
          transitionTimingFunction: "ease-out",
        },
      },
      flip: {
        in: {
          opacity: 1,
          transform: "rotateY(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "rotateY(180deg)",
          transitionTimingFunction: "ease-out",
        },
      },
      zoom: {
        in: {
          opacity: 1,
          transform: "scale(1.2)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "scale(0.8)",
          transitionTimingFunction: "ease-out",
        },
      },
      bounce: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          animation: "bounce 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        },
        out: {
          opacity: 0,
          transform: "translateY(-20px)",
          animation: "bounceOut 1s ease-out",
        },
      },
      blur: {
        in: {
          opacity: 1,
          filter: "blur(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          filter: "blur(5px)",
          transitionTimingFunction: "ease-out",
        },
      },
      skew: {
        in: {
          opacity: 1,
          transform: "skew(0deg)",
          transitionTimingFunction: "ease-in-out",
        },
        out: {
          opacity: 0,
          transform: "skew(10deg)",
          transitionTimingFunction: "ease-in-out",
        },
      },
      slideInLeft: {
        in: {
          opacity: 1,
          transform: "translateX(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "translateX(-100%)",
          transitionTimingFunction: "ease-out",
        },
      },
      slideInRight: {
        in: {
          opacity: 1,
          transform: "translateX(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "translateX(100%)",
          transitionTimingFunction: "ease-out",
        },
      },
      fadeInUp: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "translateY(10px)",
          transitionTimingFunction: "ease-out",
        },
      },
      fadeInDown: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in",
        },
        out: {
          opacity: 0,
          transform: "translateY(-10px)",
          transitionTimingFunction: "ease-out",
        },
      },
      bounceIn: {
        in: {
          opacity: 1,
          transform: "scale(1.05)",
          transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        },
        out: {
          opacity: 0,
          transform: "scale(0.9)",
          transitionTimingFunction: "ease-out",
        },
      },
    };
  }

  /**
   * Apply show animation
   * @param {HTMLElement} item - Item to animate
   * @param {string} animationType - Type of animation
   */
  applyShowAnimation(item, animationType = "fade") {
    const animation =
      this.animations[animationType]?.in || this.animations.fade.in;

    // Ensure item has transition class
    item.classList.add("afs-transition");

    // Set initial state
    item.style.display = "";
    item.style.visibility = "visible";
    
    // Special handling for mobile - immediately remove any blur
    if (window.innerWidth <= 768) {
      item.style.filter = "none";
    }

    // Force reflow
    void item.offsetHeight;

    // Add animation properties
    requestAnimationFrame(() => {
      Object.assign(item.style, {
        opacity: "0",
        transform: "scale(0.95)",
        display: "",
      });

      // Force reflow
      void item.offsetHeight;

      // Apply final state
      requestAnimationFrame(() => {
        Object.assign(item.style, animation);
      });
    });
    
    // Ensure cleanup after animation completes
    const duration = this.afs.options.get("animation.duration") || 300;
    setTimeout(() => {
      // Special handling for mobile - explicitly clean up all transition styles
      if (window.innerWidth <= 768) {
        item.style.transform = "";
        item.style.opacity = "1";
        item.style.filter = "none";
        item.style.transition = "";
      } else if (this.afs.state.getState().items.visible.has(item)) {
        // Only clean up if item is still meant to be visible
        Object.assign(item.style, {
          transform: "",
          opacity: "",
          filter: "blur(0)"
        });
      }
    }, duration + 50); // Add a small buffer for animation completion
  }

  /**
   * Apply hide animation
   * @param {HTMLElement} item - Item to animate
   * @param {string} animationType - Type of animation
   */
  applyHideAnimation(item, animationType = "fade") {
    const animation =
      this.animations[animationType]?.out || this.animations.fade.out;

    // Ensure item has transition class
    item.classList.add("afs-transition");

    // Start animation
    requestAnimationFrame(() => {
      Object.assign(item.style, animation);

      const handleTransitionEnd = () => {
        if (!this.afs.state.getState().items.visible.has(item)) {
          item.style.display = "none";
          item.style.visibility = "hidden";
        }
        item.removeEventListener("transitionend", handleTransitionEnd);
      };

      item.addEventListener("transitionend", handleTransitionEnd, {
        once: true,
      });
    });
  }

  /**
   * Update animation settings
   * @param {Object} options - Animation options
   */
  updateOptions(options) {
    const duration = options.duration || 300;
    const timing = options.timing || "ease-in-out";

    const style = document.querySelector(".afs-transition");
    if (style) {
      style.textContent = `
              .afs-transition {
                  transition: opacity ${duration}ms ${timing},
                              transform ${duration}ms ${timing},
                              filter ${duration}ms ${timing} !important;
              }
          `;
    }
  }

  /**
   * Set animation type
   * @param {string} animationType - Animation type to set
   */
  setAnimation(animationType) {
    if (this.animations[animationType]) {
      this.afs.options.set("animation.type", animationType);
    }
  }
}
