"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { installDoorNavigation } from "@/lib/door-navigation";

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isInternalPath(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function InternalNavigationEnhancer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { window.dispatchEvent(new Event("gym:route-ready")); }, [pathname]);

  useEffect(() => {
    const disposeDoors = installDoorNavigation(router);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      if (
        anchor.hasAttribute("download") ||
        (anchor.target !== "" && anchor.target !== "_self") ||
        anchor.rel.includes("external") ||
        !isInternalPath(href)
      ) {
        return;
      }

      event.preventDefault();
      router.push(href);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      disposeDoors();
    };
  }, [router]);

  return null;
}
