import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import home_img from './Assets/home_img.png';
import fb from './Assets/fb.png';
import nvidia from './Assets/nvidia.png';
import pin from './Assets/pin.png'
import apple from './Assets/apple.png';
import meta from './Assets/meta.png';
import ibm from './Assets/ibm.png';
import tesla from './Assets/tesla.png'


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Section */}
      <div className="flex flex-row items-center justify-between px-10 py-20">
        {/* Left Section - Text Content */}
        <div className="max-w-lg ml-12">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Unlock your <br /> potential with us!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Land Your Dream Job with AI-Powered Interview Coaching
          </p>
          <a
            href="/signup"
            className="inline-flex items-center bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md text-lg font-medium shadow-md transition"
          >
            Grow With Us
          </a>
        </div>

        {/* Right Section - Image */}
        <div className="max-w-md mr-12">
          <img src={home_img} alt="Interview Coaching" className="w-full" />
        </div>
      </div>

      {/* Additional Section */}
      <div className="px-20 mt-1">
        <h1 className="text-3xl font-semibold">Grab Your Opportunity at, </h1>
      </div>
      <div className="mt-8 px-10">
  <Swiper
    spaceBetween={50}
    slidesPerView={3}
    loop={true}
    autoplay={{
      delay: 2000,
      disableOnInteraction: false
    }}
    modules={[Autoplay]}
    breakpoints={{
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 4 },
    }}
    className="w-full"
  >
    <SwiperSlide className="flex justify-center items-center">
      <img src={nvidia} alt="Netflix" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={fb} alt="Facebook" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={apple} alt="Apple" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={meta} alt="Meta" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={ibm} alt="IBM" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={pin} alt="Pin" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
    <SwiperSlide className="flex justify-center items-center">
      <img src={tesla} alt="Pin" className="w-20 h-auto mx-auto" />
    </SwiperSlide>
  </Swiper>
</div>
<div className='px-20 mt-32'>
  <h1 className='text-3xl font-bold'>
  Generate ATS Friendly Resume
  </h1>
  <div className='mt-8'>
  <span className='text-[#808080]'>Designed to ensure ATS optimization<br/> so your credentials stand out to top<br/> employers and pass machine<br/> screening process.</span>
  </div>
  <div className="max-w-md mr-12">
          <img src={home_img} alt="Interview Coaching" className="w-full" />
        </div>
      </div>
      <div>
</div>
    </div>
  );
};

export default Home;