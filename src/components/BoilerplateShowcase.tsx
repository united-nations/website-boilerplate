import { typography } from "@un-eosg/ui/typography";
import { siteConfig } from "@/lib/site-config";

// Complete class names keep Tailwind's source scanner and shared theme in sync.
const palette = [
  { name: "UN Blue", className: "bg-un-blue", token: "un-blue" },
  { name: "Faded Jade", className: "bg-faded-jade", token: "faded-jade" },
  {
    name: "Camouflage Green",
    className: "bg-camouflage-green",
    token: "camouflage-green",
  },
  {
    name: "Pale Oyster",
    className: "bg-un80-warm-gray",
    token: "un80-warm-gray",
  },
  { name: "Au Chico", className: "bg-au-chico", token: "au-chico" },
  { name: "Smoky", className: "bg-smoky", token: "smoky" },
  { name: "Shuttle Gray", className: "bg-shuttle-gray", token: "shuttle-gray" },
  { name: "Trout", className: "bg-trout", token: "trout" },
  { name: "Dusty Gray", className: "bg-dusty-gray", token: "dusty-gray" },
];

/** Shared content for the static and authenticated home pages. */
export function BoilerplateShowcase() {
  return (
    <>
      <div className="max-w-2xl space-y-6">
        <h1 className={typography.pageTitle}>UN {siteConfig.name}</h1>
        <p className={typography.lead}>
          A modern, responsive foundation for United Nations web applications.
        </p>
        <a
          className="text-un-blue-text underline underline-offset-4"
          href="https://github.com/united-nations/website-boilerplate"
        >
          View on GitHub
        </a>
      </div>
      <section className="mt-12" aria-labelledby="palette-heading">
        <h2 id="palette-heading" className={typography.sectionTitle}>
          UN80 colours
        </h2>
        <p className={`${typography.meta} mt-2`}>
          The boilerplate’s working palette, supplied by the shared UI theme.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {palette.map((colour) => (
            <div key={colour.token}>
              <div
                className={`h-20 rounded-lg ${colour.className}`}
                aria-hidden="true"
              />
              <p className={`${typography.body} mt-2 font-medium`}>
                {colour.name}
              </p>
              <p className={typography.caption}>{colour.token}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
