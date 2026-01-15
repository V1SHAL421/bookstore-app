"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useBreadcrumb } from "@/app/BreadcrumbContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const { title } = useBreadcrumb();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/home" }];

    if (segments.length === 0) return breadcrumbs;

    if (segments[0] === "home") {
      breadcrumbs.push({ label: "Catalog" });
    } else if (segments[0] === "book" && segments[1]) {
      breadcrumbs.push({ label: title || "Book" });
    } else if (segments[0] === "author" && segments[1]) {
      breadcrumbs.push({ label: title || "Author" });
    } else if (segments[0] === "admin") {
      breadcrumbs.push({ label: "Admin Dashboard" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            {crumb.href ? (
              <button
                onClick={() => router.push(crumb.href!)}
                className="hover:text-gray-900 bg-transparent border-none p-0 cursor-pointer"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}