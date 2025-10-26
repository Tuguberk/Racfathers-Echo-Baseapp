export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json(
    {
      accountAssociation: {
        header: process.env.FARCASTER_HEADER,
        payload: process.env.FARCASTER_PAYLOAD,
        signature: process.env.FARCASTER_SIGNATURE,
      },
      baseBuilder: {
        ownerAddress: process.env.OWNER_ADDRESS,
      },
      frame: withValidProperties({
        version: "1",
        name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
        screenshotUrls: [],
        iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
        splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
        splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
        homeUrl: URL,
        webhookUrl: `${URL}/api/webhook`,
        primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
        tags: ["echo", "racfathers", "bitcoin", "prediction", "insights"],
        heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
        ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
        ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
        ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      }),
      miniapp: withValidProperties({
        version: "1",
        name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
        screenshotUrls: [],
        iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
        splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
        splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
        homeUrl: URL,
        webhookUrl: `${URL}/api/webhook`,
        primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
        tags: ["echo", "racfathers", "bitcoin", "prediction", "insights"],
        heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
        ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
        ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
        ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      }),
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
