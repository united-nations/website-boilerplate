import { SiteFooter as SharedFooter } from "@un-eosg/ui/components/site-footer";
export function SiteFooter() {
  return (
    <SharedFooter
      locale="en"
      containerClassName="max-w-6xl px-6 sm:px-8 lg:px-16"
      labels={{
        home: "United Nations",
        donate: "Donate",
        newTab: "opens in a new tab",
        links: {
          siteIndex: "A-Z Site Index",
          contact: "Contact",
          copyright: "Copyright",
          faq: "FAQ",
          fraudAlert: "Fraud Alert",
          privacyNotice: "Privacy Notice",
          termsOfUse: "Terms of Use",
        },
      }}
    />
  );
}
