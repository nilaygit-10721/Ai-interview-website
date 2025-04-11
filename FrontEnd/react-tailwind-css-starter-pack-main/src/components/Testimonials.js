import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "John Doe",
    role: "Software Engineer at Google",
    quote:
      "This platform revolutionized my interview prep journey. The AI feedback was incredibly insightful.",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Sarah Lee",
    role: "Data Scientist at Amazon",
    quote:
      "The resume suggestions elevated my profile, landing me multiple job offers.",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Raj Patel",
    role: "AI Engineer at Tesla",
    quote:
      "This tool helped me understand my strengths and improve my technical skills.",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Emily Chen",
    role: "Product Manager at Meta",
    quote:
      "The AI-based insights boosted my confidence during interviews. Highly recommended!",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];

export default function TestimonialSection() {
  return (
    <div className="bg-white py-16 px-8">
      <h2 className="text-4xl font-bold text-center text-green-600 mb-10">
        What Our Users Say
      </h2>
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="w-full max-w-4xl mx-auto"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="bg-blue-50 rounded-2xl shadow-md p-6 text-center flex flex-col items-center gap-4 transform transition-transform hover:scale-105 duration-300">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-20 h-20 rounded-full border-4 border-green-600"
              />
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <h3 className="text-lg font-semibold text-black">
                {testimonial.name}
              </h3>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
