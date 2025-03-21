// components/Card.js

import Link from "next/link";

const GameCard = ({ imageSrc, title, link }) => {
  return (
    <Link href={link}>
      <div className="group relative cursor-pointer">
        <img
          src={imageSrc}
          alt={title}
          className="w-48 h-48 object-cover rounded-lg transition-transform group-hover:scale-105 p-1"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-2 rounded-b-lg">
          <p className="text-white font-bold text-center">{title}</p>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
