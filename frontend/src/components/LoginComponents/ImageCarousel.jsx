import { useState, useEffect } from 'react';

const carouselImages = [
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center',
    alt: 'AI-powered collaborative learning environment',
    caption: 'Learn together with AI guidance'
  },
  {
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&crop=center',
    alt: 'Personalized AI tutoring session',
    caption: 'Personalized learning paths'
  },
  {
    src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop&crop=center',
    alt: 'Interactive AI education platform',
    caption: 'Interactive AI-powered education'
  }
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play carousel (pause on hover)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-l-2xl bg-gradient-to-br from-green-50 to-green-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Display */}
      <div className="relative h-full">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Slightly blurred background image */}
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover blur-[2px] scale-105 transition-transform duration-700"
            />

            {/* Gentle dark overlay to enhance text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 via-green-900/30 to-transparent" />

            {/* Caption */}
            <div className="absolute bottom-12 left-8 right-8 text-center">
              <h3 className="text-white text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide">
                {image.caption}
              </h3>
              <p className="text-green-100 text-lg drop-shadow-md">
                Empowering learning through artificial intelligence
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white shadow-lg scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Branding */}
      <div className="absolute top-8 left-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <h2 className="text-green-700 font-bold text-lg">AI Tutor</h2>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;