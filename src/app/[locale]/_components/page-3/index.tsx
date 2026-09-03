import Image from 'next/image'

const schedule = [
  { time: '17h30', title: 'Đón tiếp đại biểu' },
  { time: '18h20', title: 'Khai mạc chương trình' },
  { time: '18h45', title: 'Phát biểu của chủ tịch' },
  { time: '18h50', title: 'Công bố nhận diện mới của Tập đoàn' },
  { time: '19h00', title: 'Công bố đối tác chiến lược mới' },
  { time: '19h15', title: 'Khai tiệc' },
  { time: '20h00', title: 'Chương trình nghệ thuật chào mừng 14 năm thành lập ' },
  { time: '20h30', title: 'Trao giải các cuộc thi, hội thao thành lập Tập đoàn' },
  { time: '21h30', title: 'Bế mạc' },
]

const Page3 = () => {
  return (
    <section className='relative h-full w-full overflow-hidden bg-[#f8f1e4]'>
      <Image
        src='/background.png'
        alt='background'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-cover opacity-95'
      />
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-contain w-full'
      />
      <Image
        src='/decor-page-2.png'
        alt='decor'
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-contain w-[15rem] top-0 h-auto left-0 z-[1] absolute rotate-y-180'
        width={800}
        height={800}
      />
      <Image
        src='/decor-4.png'
        alt='decoration'
        className='absolute h-auto object-contain -bottom-10 left-0 w-full z-[1] rotate-y-180'
        width={800}
        height={800}
      />
      <div className='absolute-x-center top-[3.875rem] w-[82%] text-center'>
        <p className='text-[#002352] font-lora text-[1.35rem] font-bold uppercase'>
          NỘI DUNG CHƯƠNG TRÌNH
        </p>
        <Image
          src='/decor-5.svg'
          alt='decor'
          width={800}
          height={800}
          className='w-[8rem] h-auto object-contain mt-4 mx-auto'
        />
      </div>
      <div className='absolute-x-center top-[8.75rem] w-[80%] '>
        <div className='relative'>
          <div className='absolute bottom-[1rem] left-[6.125rem] top-[1.5rem] w-[0.12rem] bg-[#C29E4A]' />
          <div className='flex flex-col gap-[0.55rem]'>
            {schedule.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className='relative grid min-h-[2.5rem] grid-cols-[5.1rem_1.2rem_1fr] items-center gap-3'
              >
                <p className='font-lora pt-1 text-[1.05rem] font-bold leading-tight text-[#002352]'>
                  {item.time}
                </p>
                <span className='relative z-10 mt-[0.45rem] size-[0.68rem] rounded-full bg-[#C29E4A] shadow-[0_0_0_0.18rem_rgba(194,158,74,0.12)]' />
                <p className='pt-1 font-lora text-[0.75rem]'>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Image
        src='/logo-2.png'
        alt='decor'
        width={800}
        height={800}
        className='absolute-x-center bottom-[3.5rem] w-[6.5rem] h-auto object-contain opacity-20'
      />
    </section>
  )
}

export default Page3
