import React, { useEffect, useState } from 'react';


const AdSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg'

   
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
