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
    const def = this.animations[animationType] || this.animations.fade;
    const fromState = def.out; // the "hidden" visual state to start from
    const toState = def.in; // the "shown" visual state to end on

    // Make the item part of the layout.
    item.style.display = this.afs.filter.getItemDisplayType(item);
    item.style.visibility = "visible";

    // 1. Commit the start state with NO transition so it applies instantly.
    //    If the transition were active here, setting opacity to 0 would
    //    *animate* towards hidden, and the reverse on the next frame would
    //    cancel it — leaving the item pinned at opacity 1 (no visible fade).
    //    Each property is set explicitly (falling back to its neutral value)
    //    so switching animation types never leaves a stale transform/filter.
    const isMobile = window.innerWidth <= 768;
    item.classList.remove("afs-transition");
    item.style.transition = "none";
    item.style.opacity = fromState.opacity;
    item.style.transform = fromState.transform || "none";
    // On mobile blur is skipped (perf / rendering artifacts).
    item.style.filter = isMobile ? "none" : fromState.filter || "none";

    // Force the start state to be committed before enabling the transition.
    void item.offsetHeight;

    // 2. Re-enable the transition and animate to the shown state.
    requestAnimationFrame(() => {
      item.style.transition = "";
      item.classList.add("afs-transition");
      item.style.opacity = toState.opacity;
      item.style.transform = toState.transform || "none";
      item.style.filter = isMobile ? "none" : toState.filter || "none";
      if (toState.transitionTimingFunction) {
        item.style.transitionTimingFunction = toState.transitionTimingFunction;
      }
    });

    // Ensure cleanup after animation completes
    const duration = this.afs.options.get("animation.duration") || 300;
    setTimeout(() => {
      // Don't override if item was hidden by pagination or other systems
      const hiddenClass = this.afs.options.get("hiddenClass");
      if (hiddenClass && item.classList.contains(hiddenClass)) {
        return;
      }

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
          opacity: "1",
          filter: "none",
          display: this.afs.filter.getItemDisplayType(item)
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

    // Set initial state
    item.style.display = this.afs.filter.getItemDisplayType(item);
    item.style.visibility = "visible";

    // Force reflow
    void item.offsetHeight;

    // Add animation properties
    requestAnimationFrame(() => {
      Object.assign(item.style, animation);
    });

    // Ensure final state after animation
    const duration = this.afs.options.get("animation.duration") || 300;
    setTimeout(() => {
      if (!this.afs.state.getState().items.visible.has(item)) {
        // Add the hidden class too, so hiding through any path (afs.hideItem,
        // search, range, date) leaves the same DOM state as Filter.applyFilters.
        const hiddenClass = this.afs.options.get("hiddenClass");
        if (hiddenClass) item.classList.add(hiddenClass);
        item.style.display = "none";
        item.style.visibility = "hidden";
        item.style.opacity = "0";
        item.style.transform = "";
        item.style.filter = "none";
        item.style.transition = "";
      }
    }, duration + 50);
  }

}
