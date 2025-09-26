"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div>
      <Authenticated>
        <UserButton />
      </Authenticated>
      <Unauthenticated>
        <SignInButton>Sign In</SignInButton>
      </Unauthenticated>
    </div>
  );
}
