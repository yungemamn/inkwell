// client/src/components/NavBar.jsx
//
// Base (unprefixed) classes target mobile first (Section 4.5).
// md: and lg: prefixes layer on enhancements for larger viewports —
// never the reverse.
//
// Section 1.2's breakpoint model: below 640px the navigation shows only
// icons; from lg: upward it also shows the full text labels.

import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/",
    label: "Feed",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h10"
      />
    ),
  },
  {
    to: "/write",
    label: "Write",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
      />
    ),
  },
  {
    to: "/login",
    label: "Log In",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
      />
    ),
  },
];

export function NavBar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <NavLink to="/" className="text-lg font-bold">
        Inkwell
      </NavLink>

      <div className="flex gap-1 lg:gap-4">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center gap-2 rounded px-3 text-sm ${
                isActive ? "font-semibold text-indigo-600" : "text-gray-600"
              }`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
            >
              {icon}
            </svg>
            {/* Icon-only on mobile; the label joins it at lg: (Section 1.2). */}
            <span className="hidden lg:inline">{label}</span>
            <span className="sr-only lg:hidden">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
