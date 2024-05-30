"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import config from "@/config";
import Modal from "@/components/Modal"; // Import the Modal component
import ButtonLead from "@/components/ButtonLead";

const ButtonSignin = ({ text = "Get started", extraStyle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  if (user) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}
      >
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
          </span>
        )}
        {user?.user_metadata?.name || user?.email || "Account"}
      </Link>
    );
  }

  return (
    <>
      <button
        className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}
        onClick={openModal}
      >
        {text}
    </button>

      {/* Modal component */}
      <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <ButtonLead />
      </Modal>
    </>
  );
};

export default ButtonSignin;
