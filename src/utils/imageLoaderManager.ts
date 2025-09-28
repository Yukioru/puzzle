type Callback = () => void;

class ScopedImageLoader {
  private pending = 0;
  private callbacks: Callback[] = [];
  private tracked = new WeakMap<
    Element,
    { sig: string; cleanup: () => void; done: boolean }
  >();

  constructor(private root: HTMLElement | Document) {}

  addListener(cb: Callback) {
    this.callbacks.push(cb);
  }

  removeListener(cb: Callback) {
    this.callbacks = this.callbacks.filter((c) => c !== cb);
  }

  private notify() {
    if (this.pending === 0) {
      this.callbacks.forEach((cb) => cb());
    }
  }

  private signature(el: HTMLImageElement | SVGImageElement) {
    if (el instanceof HTMLImageElement) {
      return `${el.currentSrc}|${el.src}|${el.srcset}|${el.sizes}`;
    } else {
      return (
        el.href?.baseVal ??
        el.getAttribute("href") ??
        el.getAttribute("xlink:href") ??
        ""
      );
    }
  }

  private track(el: HTMLImageElement | SVGImageElement) {
    const sig = this.signature(el);
    const prev = this.tracked.get(el);

    // Если ресурс не поменялся — повторно не трекаем
    if (prev && prev.sig === sig) return;

    // Если был старый незавершённый трек — снимаем
    if (prev && !prev.done) {
      this.pending = Math.max(0, this.pending - 1);
      prev.cleanup();
    }

    this.pending++;

    let doneCalled = false;
    const done = () => {
      if (doneCalled) return;
      doneCalled = true;
      this.pending = Math.max(0, this.pending - 1);
      this.notify();
      const info = this.tracked.get(el);
      if (info) info.done = true;
    };

    if (el instanceof HTMLImageElement) {
      // Уже загружено
      if (el.complete && el.naturalWidth > 0) {
        queueMicrotask(done);
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        return;
      }
      // Cancelled
      if (el.complete && el.naturalWidth === 0) {
        queueMicrotask(done);
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        return;
      }

      const onLoad = () => {
        cleanup();
        done();
      };
      const onError = () => {
        cleanup();
        done();
      };
      const cleanup = () => {
        el.removeEventListener("load", onLoad);
        el.removeEventListener("error", onError);
      };

      el.addEventListener("load", onLoad, { once: true });
      el.addEventListener("error", onError, { once: true });

      this.tracked.set(el, { sig, cleanup, done: false });
    } else {
      // SVG <image>
      const href =
        el.href?.baseVal ??
        el.getAttribute("href") ??
        el.getAttribute("xlink:href");

      if (!href) {
        queueMicrotask(done);
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        return;
      }

      // создаём временный Image() для отлова load/error
      const img = new Image();
      const onLoad = () => {
        cleanup();
        done();
      };
      const onError = () => {
        cleanup();
        done();
      };
      const cleanup = () => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onError);
      };

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);
      img.src = href;

      this.tracked.set(el, { sig, cleanup, done: false });
    }
  }

  observe() {
    this.pending = 0;
    this.tracked = new WeakMap();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node instanceof HTMLImageElement || node instanceof SVGImageElement) {
              this.track(node);
            }
            if (node instanceof HTMLElement) {
              node.querySelectorAll("img, svg image").forEach((el) =>
                this.track(el as HTMLImageElement | SVGImageElement)
              );
            }
          });
        }
        if (m.type === "attributes" && m.target instanceof Element) {
          if (
            m.attributeName &&
            ["src", "srcset", "sizes", "href", "xlink:href"].includes(m.attributeName)
          ) {
            if (
              m.target instanceof HTMLImageElement ||
              m.target instanceof SVGImageElement
            ) {
              this.track(m.target);
            }
          }
        }
      });
    });

    observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "sizes", "href", "xlink:href"],
    });

    // сразу трекаем уже существующие
    this.root.querySelectorAll?.("img, svg image").forEach((el) => {
      this.track(el as HTMLImageElement | SVGImageElement);
    });

    return () => observer.disconnect();
  }
}

export function createScopedLoader(root: HTMLElement | Document) {
  return new ScopedImageLoader(root);
}