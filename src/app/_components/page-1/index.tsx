import Image from 'next/image'

const Page1 = () => {
  return (
    <section className='relative h-full w-full overflow-hidden bg-[#f7f0df]'>
      <Image
        src='/background.png'
        alt='background'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-cover'
        priority
      />
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-contain w-'
      />
      <Image
        src='/logo.svg'
        alt='logo'
        className='absolute-x-center top-[6.25rem] h-auto w-[14.25rem] object-contain drop-shadow-[0_0.6rem_1.4rem_rgba(72,44,12,0.16)]'
        width={400}
        height={400}
      />

      <div className='absolute-x-center top-[21rem] w-[82%] text-center'>
        <h1 className='font-pinyon-script text-[2.6rem] leading-none text-[#c29e4a] drop-shadow-[0_0.15rem_0_rgba(255,255,255,0.75)]'>
          Thiệp mời
        </h1>
        <Image
          src='/hr.svg'
          alt='decoration'
          className='h-auto w-[8rem] object-contain mx-auto mt-2'
          width={400}
          height={400}
        />
        <p className='mx-auto mt-2 font-lora text-[1.5rem] font-bold uppercase leading-relaxed text-[#002352]'>
          Lễ kỷ niệm <br /> <span className='text-[#C29E4A] font-bold font-lora'>14</span> năm thành
          lập <br /> Tập đoàn Bateco
        </p>
      </div>
      <Image
        src='/decor-4.png'
        alt='decoration'
        className='absolute h-auto object-contain -bottom-10 left-0 w-full z-[1]'
        width={800}
        height={800}
      />
      <Image
        src='/tower.svg'
        alt='tower'
        className='absolute h-auto object-contain -bottom-2 left-0 w-[20rem]'
        width={800}
        height={800}
      />
    </section>
  )
}

export default Page1
