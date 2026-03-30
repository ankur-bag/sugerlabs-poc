import { AnimatePresence } from "framer-motion";
import "../styles/globals.css";
import Head from "next/head";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isReflectPage = router.pathname === "/reflect";

  return (
    <ClerkProvider>
      <Head>
        <title>Sugar Reflect Journal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {!isReflectPage && (
        <header className="absolute top-0 right-0 p-6 z-50 flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="framer-button px-6 py-2 text-sm bg-gray-900 text-white rounded-full">Sign In</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </header>
      )}
      <AnimatePresence mode="wait">
        <Component key={router.route} {...pageProps} />
      </AnimatePresence>
    </ClerkProvider>
  );
}
