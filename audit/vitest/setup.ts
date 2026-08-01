import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})

const noop = () => {}

if (!("ResizeObserver" in window)) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  })
}

if (!("IntersectionObserver" in window)) {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  })
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }) as MediaQueryList,
})

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(Date.now()), 16)
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle)
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = noop
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = noop
  Element.prototype.releasePointerCapture = noop
}

if (!("PointerEvent" in window)) {
  class PointerEventMock extends MouseEvent {}
  Object.defineProperty(window, "PointerEvent", {
    writable: true,
    configurable: true,
    value: PointerEventMock,
  })
}

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => []
}

if (!window.scrollTo) {
  window.scrollTo = noop
}

const defaultRect: DOMRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 40,
  right: 100,
  width: 100,
  height: 40,
  toJSON: () => ({}),
}

Element.prototype.getBoundingClientRect = () => defaultRect
