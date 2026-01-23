import React from 'react';
import Shape from './shape.jsx';

function ContentSection({ title, description, imageSrc, textPosition = 'left' }) {
  const isTextRight = textPosition === 'right';

  return (
    <section className={`flex flex-col gap-8 mx-auto items-center min-h-[70vh] px-5vw py-12 ${isTextRight ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

      {/* Text Block */}
      {/* Added min-h to ensure shape has room. */}
      <div className="relative flex flex-col justify-center items-center text-center w-full max-w-md lg:max-w-lg flex-shrink-0 min-h-[350px] sm:min-h-[450px]">
        <div className="absolute inset-0 z-0 flex justify-center items-center">
          {/* The SVG background gets slightly scaled up to ensure coverage */}
          <Shape className="fill-linkler-orange-light w-[105%] h-[105%]" />
        </div>

        {/* UPDATED PADDING:
           Significantly increased padding to push text away from the irregular edges.
           Using specific px and py values for better control across breakpoints.
        */}
        <div className="relative z-10 flex flex-col gap-4 rotate-1 justify-center h-full px-12 py-14 sm:px-16 sm:py-20 lg:px-24 lg:py-28">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{title}</h2>

          {/* ADDED MAX-WIDTH TO PARAGRAPH:
             Restricts line length to keep text in the "safe zone" of the blob.
          */}
          <p className="text-sm sm:text-base mx-auto max-w-[32ch] sm:max-w-[40ch]">
            {description}
          </p>
        </div>
      </div>

      {/* Image Block */}
      <div className="w-full max-w-md lg:max-w-lg rounded-tr-[80px] rounded-bl-[80px] overflow-hidden flex-shrink-0 z-10 shadow-xl">
        <img src={imageSrc} alt={title} className="w-full h-auto block object-cover" />
      </div>

    </section>
  );
}

export default ContentSection;
