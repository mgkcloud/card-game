import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import GameCard from "./GameCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GameSection = ({ deckCards }) => {
  const initialCards = [
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Technology",
      link: "/room/technology",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Arts",
      link: "/room/arts",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Music",
      link: "/room/music",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Golf",
      link: "/room/golf",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Politics",
      link: "/room/politics",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Books",
      link: "/room/Books",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "History",
      link: "/room/History",
    },
    {
      imageSrc:
        "https://64.media.tumblr.com/688e3daee996f6a81184c80ef91f1e69/e5526f40e54ac86f-9f/s640x960/d4a549fd4f5a1bbe9d1b947f0808d20148de1a51.png",
      title: "Baseball",
      link: "/room/baseball",
    },
  ];

  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    if (deckCards && deckCards.length > 0) {
      const updatedCards = cards.map((card, index) => {
        if (deckCards[index]) {
          return { ...card, imageSrc: deckCards[index].mediaSrc };
        }
        return card;
      });
      // setCards(updatedCards);
    }
  }, [deckCards]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 8,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          arrows: false,
          autoplay: true,
          autoplaySpeed: 2000,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          arrows: false,
          autoplay: true,
          autoplaySpeed: 2000,
        },
      },
    ],
  };

  return (
    <div className="top-5 fixed w-full p-4 cursor-pointer">
      <Slider {...settings}>
        {cards.map((card, index) => (
          <GameCard key={index} {...card} />
        ))}
      </Slider>
    </div>
  );
};

export default GameSection;
