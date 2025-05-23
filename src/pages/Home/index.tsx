import { Canvas } from "@react-three/fiber";
import { Link, useSearchParams } from "react-router";
import sitemap from "~/utils/sitemap";
import HomeCanvasContent from "./components/HomeCanvasContent";
import { Leva } from "leva";
import { Suspense } from "react";

export default function Home() {
  const [searchParams] = useSearchParams();
  const showLeva = searchParams.has("debug");
  return (
    <div className="h-svh grid place-items-center w-full">
      <ul className="flex flex-col gap-8 justify-center h-full p-4 z-[1]">
        {Object.entries(sitemap)
          .filter(([key]) => key !== "home")
          .map(([, link]) => (
            <li key={link.path}>
              <Link
                className="~text-3xl/4xl hover:underline hover:cursor-pointer"
                to={link.path}
              >
                {link.label}
              </Link>
            </li>
          ))}
      </ul>
      <div className="absolute inset-0">
        <Canvas>
          <Suspense>
            <HomeCanvasContent />
          </Suspense>
        </Canvas>
        <Leva hidden={!showLeva} />
      </div>
    </div>
  );
}
