"use client";

// Browser page translation (Chrome / Google Translate, Edge, in-app browsers)
// swaps the page's text nodes for <font> elements it owns. When React later
// updates or removes one of those text nodes (a counter ticking, a status
// line changing), the node is no longer where React left it and the DOM call
// throws "NotFoundError: Failed to execute 'removeChild' on 'Node'", which
// takes the whole page down ("Application error: a client-side exception").
//
// The fix suggested on the React tracker (facebook/react#11538): when the
// node has already been moved away, skip the call instead of throwing. The
// translated text may then lag behind until a reload, but the page stays up.
// Runs once, when this module loads in the browser, before any translation.
if (typeof window !== "undefined" && typeof Node === "function" && Node.prototype) {
  const proto = Node.prototype as Node & { __whTranslationGuard?: boolean };
  if (!proto.__whTranslationGuard) {
    proto.__whTranslationGuard = true;
    const removeChild = proto.removeChild;
    proto.removeChild = function <T extends Node>(this: Node, child: T): T {
      if (child.parentNode !== this) return child;
      return removeChild.call(this, child) as T;
    };
    const insertBefore = proto.insertBefore;
    proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
      if (ref && ref.parentNode !== this) return node;
      return insertBefore.call(this, node, ref) as T;
    };
  }
}

export default function TranslationGuard() {
  return null;
}
