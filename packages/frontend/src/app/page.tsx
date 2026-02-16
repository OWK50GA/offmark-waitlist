'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Submitting...")
    setIsSubmitting(true);
    // setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Data: ", data);

      if (response.ok && data.success) {
        toast.success('Successfully joined the waitlist!');
        setEmail('');
      } else {
        toast.error(data.error.message || 'Failed to join waitlist');
      }
    } catch (error) {
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        // setMessage('')
      }, 5000);
    }
  };

  return (
    <div className="bg-[#100e0e] min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Blur effects */}
      <Toaster />
      <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[125px] h-[525px] left-[360px] rounded-[262.5px] top-[2241px] md:w-[527px] pointer-events-none" />
      <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[125px] h-[459px] left-[-230px] rounded-[229.5px] top-[1076px] md:w-[461px] pointer-events-none" />
      
      {/* Hero Background */}
      <div className="absolute h-[994px] left-0 top-0 w-full mx-auto">
        <Image
          alt=""
          className="absolute inset-0 object-cover pointer-events-none w-full h-full"
          src="/assets/figma/rectangle-164.png"
          fill
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative backdrop-blur-xs bg-[rgba(33,31,31,0.68)] flex flex-col gap-[32px] min-h-[994px] items-center overflow-clip pb-[-2px] pt-[169px] px-4 md:px-[104px]">
        {/* Header with Logo */}
        <div className="absolute h-[98px] left-0 top-0 w-full">
          <Image
            alt=""
            className="absolute inset-0 object-cover pointer-events-none w-full h-full"
            src="/assets/figma/rectangle-182.png"
            fill
          />
        </div>
        
        <div className="absolute h-[31px] left-[36px] top-[31px] w-[167px]">
          <Image
            alt="OffMark Logo"
            className="absolute inset-0 object-cover pointer-events-none w-full h-full"
            src="/assets/figma/frame-114x7.png"
            fill
          />
        </div>

        {/* Hero Section */}
        <div className="flex flex-col gap-[31px] items-center w-full max-w-[991px] z-10">
          <div className="backdrop-blur-xs bg-[rgba(45,19,10,0.73)] h-[49px] rounded-[30.4px] flex items-center justify-center px-[83px]">
            <p className="font-['Poppins'] font-medium text-[20px] text-white">Coming soon</p>
          </div>
          
          <h1 className="font-['Poppins'] font-semibold text-[40px] md:text-[80px] text-center text-white leading-normal">
            Get Early Access
          </h1>
          
          <p className="font-['Poppins'] font-normal text-[17px] md:text-[33px] text-center text-white leading-normal max-w-full">
            <span>We are getting close. Sign up to gain early access to </span>
            <span className="text-[#f05a25]">offmark</span>
            <span> priviledge</span>
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-[569px] px-4 md:px-0 z-10">
          <div className="backdrop-blur-sm bg-[rgba(255,255,255,0.08)] border-2 border-[rgba(100,100,100,0.38)] h-auto md:h-[68px] rounded-[30.4px] flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 p-3 md:px-[26px] md:py-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-transparent font-['Poppins'] text-[16px] md:text-[20px] text-white placeholder-gray-400 outline-none py-2 md:py-0"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="backdrop-blur-[2px] bg-white border-2 border-[rgba(181,181,181,0.14)] h-[48px] md:h-[59px] rounded-[24px] md:rounded-[29.5px] px-0 md:px-7 font-['Poppins'] font-semibold text-[16px] md:text-[20px] text-[#f05a25] hover:bg-opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>
          {/* {message && (
            <p className={`mt-4 text-center font-['Poppins'] text-[14px] md:text-[15px]`}>
              
              {message}
            </p>
          )} */}
        </form>

        {/* Phone Mockup - Only top 40%, sliced in half */}
        <div className="relative h-[402px] w-[447px] hidden lg:block overflow-hidden">
          {/* Phone body - rounded top, sharp bottom */}
          <div className="absolute bg-black border-[#989892] border-[3.6px] border-b-0 rounded-t-[45.7px] left-[6.6px] top-0 right-[6.6px] h-full">
            <div className="absolute inset-0 pointer-events-none rounded-t-[inherit] shadow-[inset_0px_0px_0.3px_3.9px_#3f3f3f]" />
          </div>
          
          {/* Outer stroke - rounded top, sharp bottom */}
          <div className="absolute bg-[rgba(0,0,0,0)] border-[#1b1c16] border-[0.55px] border-b-0 rounded-t-[47.5px] left-[5.5px] top-0 right-[5.5px] h-full">
            <div className="absolute inset-0 pointer-events-none rounded-t-[inherit] shadow-[inset_0px_0px_0.3px_1.4px_#77796b]" />
          </div>
          
          {/* Screen content */}
          <div className="absolute left-[25px] top-[17px] w-[401px] h-[385px] overflow-hidden rounded-t-[35px]">
            <Image
              alt="App Preview"
              src="/assets/figma/image-1.png"
              fill
              className="object-cover object-top"
            />
          </div>
          
          {/* Notch with rounded corners */}
          <div className="absolute bg-[#141414] border-[#0e0e0e] border-[0.27px] rounded-[8px] left-[181px] top-[7.4px] w-[85px] h-[34px]">
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-0.8px_0px_0px_0px_#2a2a2a,inset_0.8px_0px_0px_0px_#2a2a2a,inset_0px_0px_1.3px_0.27px_black]" />
          </div>
          
          {/* Front Camera */}
          <div className="absolute left-[213px] top-[31.3px] w-[21.7px] h-[21.3px]">
            <img
              alt=""
              src="/assets/figma/lens-1.png"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-4 md:px-[112px] py-16">
        <h2 className="font-['Poppins'] font-medium text-[40px] text-[#dcdcdc] text-center mb-7">
          Features to Anticipate
        </h2>
        
        <p className="font-['Poppins'] text-[20px] text-[#dcdcdc] text-center mb-10">
          On official release, <span className="font-medium text-[#f05a25]">OffMark </span>
          presents
        </p>

        {/* Feature Grid - 2x2 layout with varying heights */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-[2px] max-w-[1183px] mx-auto"> */}
        <div className="flex flex-col md:flex-row gap-x-7 gap-y-4 md:gap-y-[2px] w-full md:max-w-[1183px] mx-auto">
          <div className='flex flex-col gap-7 md:w-full lg:w-4/5 xl:w-3/5'>
            {/* Social Feed - Top Left - SHORTER with full feed image */}
            <div className="border border-[#7a5a51] h-[476px] rounded-[10px] overflow-hidden relative">
              <div className="backdrop-blur-[2px] bg-[#161515] h-full rounded-[10px] p-7 relative">
                <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[42px] h-[347px] w-[347px] rounded-[173.5px] left-[28px] top-[72px]" />
                <p className="relative font-['Poppins'] text-[20px] text-[#dcdcdc] mb-7 z-10">
                  <span className="font-medium text-[#f05a25]">Social Feed </span>
                  for interaction of user with like fashion interest
                </p>
                
                {/* Full feed image - not cropped */}
                <div className="relative h-[320px] w-full rounded-[17px] overflow-hidden mt-7 z-10">
                  <img
                    alt="Social Feed Preview"
                    src="/assets/figma/socials.png"
                    // fill
                    // width="426"
                    height="350"
                    className="object-cover -translate-y-16 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Chat Rooms - Bottom Left - TALLEST with chat interface */}
            <div className="border border-[#7a5a51] h-[620px] rounded-[10px] overflow-hidden relative">
              <div className="backdrop-blur-[2px] bg-[#151414] h-full rounded-[10px] p-7 relative">
                <div className="absolute bg-[rgba(240,90,37,0.28)] blur-[42px] h-[347px] w-[347px] rounded-[173.5px] left-[65px] top-[79px]" />
                <p className="relative font-['Poppins'] text-[20px] text-[#dcdcdc] mb-7 z-10">
                  <span className="font-medium text-[#dcdcdc]">Active </span>
                  <span className="font-medium text-[#f05a25]">chat rooms </span>
                  for collaborative sessions among users
                </p>
                
                {/* Chat interface with "Chats" header and DM snippets */}
                <div className="relative mt-7 z-10">
                  {/* Full chat interface image showing "Chats" header and DM list */}
                  <div className="relative h-[422px] w-full rounded-[17px] overflow-hidden">
                    <Image
                      alt="Chat Rooms Interface"
                      src="/assets/figma/chat-offmark.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-7'>
            {/* Marketplace Gallery - Top Right - SAME HEIGHT AS BOTTOM RIGHT */}
            <div className="border border-[#7a5a51] h-[549px] rounded-[10px] overflow-hidden relative">
              <div className="backdrop-blur-[2px] bg-[#151414] h-full rounded-[10px] p-7 relative">
                <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[125px] h-[347px] w-[347px] rounded-[173.5px] left-[27px] top-[110px]" />
                <p className="relative font-['Poppins'] text-[20px] text-[#dcdcdc] mb-7 z-10">
                  Categorized display of fashion merchandise on{' '}
                  <span className="font-medium text-[#f05a25]">market place</span>
                </p>
                
                {/* Image layout: overlapping with borders */}
                <div className="relative mt-7 h-[350px] z-10">
                  {/* Back image - positioned at back right */}
                  <div className="absolute h-[295px] w-[322px] rounded-[17px] overflow-hidden right-0 top-[10px]">
                    <Image
                      alt="Fashion item"
                      src="/assets/figma/rectangle-168.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Overlay on back image */}
                  <div className="absolute backdrop-blur-[2px] bg-[rgba(1,1,1,0.27)] h-[286px] md:w-[322px] rounded-[17px] right-0 top-[17px] z-10" />
                  
                  {/* Left bordered image */}
                  <div className="absolute h-[207px] w-[322px] rounded-[17px] overflow-hidden border border-[#f05a25] left-0 top-0 z-20">
                    <Image
                      alt="Fashion item"
                      src="/assets/figma/rectangle-168.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Bottom bordered image */}
                  <div className="absolute h-[207px] w-[322px] rounded-[17px] overflow-hidden border border-[#f05a25] left-[28px] bottom-0 z-20">
                    <Image
                      alt="Fashion item"
                      src="/assets/figma/rectangle-168.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Space - Bottom Right - SAME HEIGHT AS TOP RIGHT */}
            <div className="border border-[rgba(213,162,144,0.55)] h-[549px] rounded-[10px] overflow-hidden relative">
              <div className="backdrop-blur-[2px] bg-[#151414] h-full rounded-[10px] p-7 relative">
                <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[125px] h-[347px] w-[347px] rounded-[173.5px] left-[239px] top-[83px]" />
                <div className="absolute bg-[rgba(240,90,37,0.29)] blur-[125px] h-[347px] w-[347px] rounded-[173.5px] left-[-74px] top-[-65px]" />
                <p className="relative font-['Poppins'] text-[20px] text-[#dcdcdc] mb-7 z-10">
                  <span className="text-[#f05a25]">Creator space</span>
                  {' '}allowing users describe a particular design of interest with precision
                </p>
                
                {/* Image layout: side by side with overlays */}
                <div className="relative mt-7 h-[350px] z-10">
                  {/* Left bordered image */}
                  <div className="absolute h-[150px] md:h-[217px] w-[270px] md:w-[392px] rounded-[17px] overflow-hidden border border-[#f05a25] left-0 top-45 md:top-15 z-10">
                    <Image
                      alt="Creator space preview"
                      src="/assets/figma/description.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Right taller image with overlay */}
                  <div className="absolute h-[270px] md:h-[330px] w-[319px] md:w-[392px] rounded-[17px] overflow-hidden right-0 top-0">
                    <div className="bg-[rgba(1,1,1,0.27)] absolute inset-0" />
                    <Image
                      alt="Creator space preview"
                      src="/assets/figma/edit.png"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
