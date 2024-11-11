import React, { useEffect, useState } from 'react';


const AdSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    '/image1.jpeg',
    '/image2.jpeg',
    '/image3.jpeg',
    '/image4.jpeg',
    '/image5.jpeg',
    '/image6.jpeg',
    '/image7.jpeg'

   
    // 필요한 만큼 이미지 추가
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // 이미지가 순환하도록 설정
    }, 10000); // 3초마다 이미지 변경

    return () => {
      clearInterval(interval); // 컴포넌트가 언마운트될 때 interval 정리
    };
  }, [images.length]);

  return (
    <div className="slider-container">
      <img src={images[currentIndex]} alt="광고" className="slider-image" />
    </div>
  );
};

export default AdSlider;
