import { useEffect, useState } from 'react';
import { imagesArray } from '../../../constants/register';

const ImagesSlider = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === imagesArray?.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleDotClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="flex-1 hidden md:w-1/2 md:h-full relative md:flex justify-center items-center">
            <img src={imagesArray[currentImageIndex]} className="w-full h-full" alt="slider" />
            <div className="absolute bottom-20 flex flex-col justify-center items-center px-10">
                <p className="sm:text-lg md:text-xl text-white text-center mb-4">
                    A platform that bridges the gap between the school, the parents, and the students.
                </p>
                <div className="flex space-x-2">
                    {imagesArray.map((_, index) => (
                        <div
                            key={index}
                            className={`w-5 h-5 rounded-full border border-white cursor-pointer ${index === currentImageIndex ? 'bg-white' : 'bg-transparent'}`}
                            onClick={() => handleDotClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>

    );
};

export default ImagesSlider;