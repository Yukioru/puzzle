type Callback = () => void;

interface LoadingStatus {
  allLoaded: boolean;
  trackedCount: number;
}

type StatusCallback = (status: LoadingStatus) => void;

class ScopedImageLoader {
  private pending = 0;
  private trackedCount = 0;
  private callbacks: Callback[] = [];
  private statusCallbacks: StatusCallback[] = [];
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

  addStatusListener(cb: StatusCallback) {
    this.statusCallbacks.push(cb);
  }

  removeStatusListener(cb: StatusCallback) {
    this.statusCallbacks = this.statusCallbacks.filter((c) => c !== cb);
  }

  private notifyStatus() {
    this.statusCallbacks.forEach((cb) => cb({
      allLoaded: this.pending === 0,
      trackedCount: this.trackedCount,
    }));
  }

  private notify() {
    if (this.pending === 0) {
      this.callbacks.forEach((cb) => cb());
    }

    this.notifyStatus();
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

  private loadImage(src: string) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const decode = () => {
        if (typeof img.decode !== "function") {
          finish();
          return;
        }

        img.decode().then(finish).catch(finish);
      };

      img.decoding = "sync";
      img.onload = decode;
      img.onerror = finish;
      img.src = src;

      if (img.complete) {
        decode();
      }
    });
  }

  private decodeHtmlImage(el: HTMLImageElement) {
    if (typeof el.decode !== "function") {
      return Promise.resolve();
    }

    return el.decode().catch(() => undefined);
  }

  private track(el: HTMLImageElement | SVGImageElement) {
    const sig = this.signature(el);
    const prev = this.tracked.get(el);

    if (prev && prev.sig === sig) return;

    if (prev && !prev.done) {
      this.pending = Math.max(0, this.pending - 1);
      prev.cleanup();
    }

    this.pending++;
    this.trackedCount++;
    this.notifyStatus();

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
      if (el.complete && el.naturalWidth > 0) {
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        this.decodeHtmlImage(el).then(done);
        return;
      }
      if (el.complete && el.naturalWidth === 0) {
        queueMicrotask(done);
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        return;
      }

      const onLoad = () => {
        cleanup();
        this.decodeHtmlImage(el).then(done);
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
      const href =
        el.href?.baseVal ??
        el.getAttribute("href") ??
        el.getAttribute("xlink:href");

      if (!href) {
        queueMicrotask(done);
        this.tracked.set(el, { sig, cleanup: () => {}, done: true });
        return;
      }

      let cancelled = false;
      const cleanup = () => {
        cancelled = true;
      };

      this.tracked.set(el, { sig, cleanup, done: false });
      this.loadImage(href).then(() => {
        if (!cancelled) {
          done();
        }
      });
    }
  }

  observe() {
    this.pending = 0;
    this.trackedCount = 0;
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

    queueMicrotask(() => this.notify());

    return () => observer.disconnect();
  }
}

export function createScopedLoader(root: HTMLElement | Document) {
  return new ScopedImageLoader(root);
}
