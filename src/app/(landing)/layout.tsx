import { PropsWithChildren } from "react";
import { getGameById } from "~/dal/queries";
import { LandingBackground } from "~/screens/LandingBackground";

export const dynamic = 'force-dynamic';

export default async function LandingLayout({ children }: Readonly<PropsWithChildren>) {
  const data = await getGameById('test');

  return (
    <LandingBackground data={data}>
      {children}
    </LandingBackground>
  );
}
