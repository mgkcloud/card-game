"use client";
import Player from "@/components/game/Player";
import { useSearchParams, useRouter } from "next/navigation";
import DealerSection from "@/components/game/DealerSection";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import ButtonSignin from "@/components/ButtonSignin";
import ButtonAccount from "@/components/ButtonAccount";

export default function Cards() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  return (
    <main
      className="w-[100vw] h-[100vh]  bg-neutral text-neutral-content"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <div className="bg-neutral text-neutral-content">
        {user ? <ButtonAccount /> : <ButtonSignin />}
      </div>
    </main>
  );
}
