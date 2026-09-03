import { MapPinIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const Page2 = () => {
  return (
    <section className='relative h-full w-full overflow-hidden bg-[#f8f1e4] pointer-events-auto'>
      <Image
        src='/background.png'
        alt='background'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='pointer-events-none object-cover opacity-95'
      />
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='pointer-events-none w-full object-contain'
      />
      <Image
        src='/decor-page-2.png'
        alt='decor'
        sizes='(max-width: 639px) 92vw, 460px'
        className='pointer-events-none absolute right-0 top-0 z-[1] h-auto w-[15rem] object-contain'
        width={800}
        height={800}
      />
      <Image
        src='/decor-4.png'
        alt='decoration'
        className='pointer-events-none absolute -bottom-10 left-0 z-[1] h-auto w-full object-contain'
        width={800}
        height={800}
      />
      <div className='absolute-x-center relative z-10 w-[82%] translate-y-16 text-center'>
        <p className='text-[#002352] font-lora text-[1.5rem] font-bold uppercase'>
          Tập đoàn Bateco
        </p>
        <p className='text-[#002352] font-lora text-[1rem] font-bold uppercase'>
          Trân trọng kính mời
        </p>
        <p
          className='font-style-script mt-4 text-[1.875rem]'
          style={{ fontFamily: "'Style Script', cursive", fontWeight: 400 }}
        >
          Ông Phạm Trung Hưng
        </p>
        <p className='font-lora text-[0.75rem]'>
          Nguyên Chánh văn phòng <br />
          Tập đoàn Công nghiệp Than - Khoáng sản Việt Nam
        </p>
        <p
          className='font-style-script text-[1.875rem] mt-1'
          style={{ fontFamily: "'Style Script', cursive", fontWeight: 400 }}
        >
          cùng Phu nhân
        </p>
        <div className='flex gap-2 justify-center mt-8'>
          <Image
            src='/line.png'
            alt='decor'
            width={800}
            height={800}
            className='w-[5rem] h-auto object-contain mt-1.5'
          />
          <p className='text-[#002352] font-lora text-[0.875rem] font-bold'>Tới tham dự</p>
          <Image
            src='/line-2.png'
            alt='decor'
            width={800}
            height={800}
            className='w-[5rem] h-auto object-contain mt-1.5 -translate-x-2'
          />
        </div>
        <p className='text-[#002352] font-lora text-[1.25rem] font-bold uppercase mt-4'>
          LỄ KỶ NIỆM 14 NĂM <br /> THÀNH LẬP TẬP ĐOÀN BATECO
        </p>
        <Image
          src='/decor-5.svg'
          alt='decor'
          width={800}
          height={800}
          className='w-[8rem] h-auto object-contain mt-4 mx-auto'
        />

        <div className='flex flex-col items-center justify-center mt-4'>
          <p className='text-[#002352] font-lora text-[1.25rem] font-bold uppercase'>THÁNG 9</p>
          <div className='flex justify-center items-center gap-4 translate-x-3'>
            <p className='text-[#002352] font-lora text-[1.25rem] font-bold uppercase pr-2 border-r-2 border-[#C29E4A]'>
              Thứ 6
            </p>
            <p className='text-[#C29E4A] text-[2.5rem] font-bold'>18</p>
            <p className='text-[#002352] font-lora text-[1.25rem] font-bold uppercase pl-2 border-l-2 border-[#C29E4A]'>
              08:00 PM
            </p>
          </div>
          <p className='text-[#002352] font-lora text-[1.25rem] font-bold uppercase -translate-x-1'>
            2026
          </p>
          <div className='flex gap-2 justify-center mt-8'>
            <Image
              src='/line.png'
              alt='decor'
              width={800}
              height={800}
              className='w-[5rem] h-auto object-contain mt-1.5'
            />
            <p className='text-[#002352] font-lora text-[0.875rem] font-bold'>Địa điểm</p>
            <Image
              src='/line-2.png'
              alt='decor'
              width={800}
              height={800}
              className='w-[5rem] h-auto object-contain mt-1.5 -translate-x-2'
            />
          </div>
          <div className='flex items-center justify-center gap-2 mt-6'>
            <MapPinIcon className='size-6 text-[#C29E4A]' />
            <Link
              href='https://maps.app.goo.gl/5y3VsoYPvU6d9ZoU7'
              target='_blank'
              rel='noreferrer'
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className='relative z-20 cursor-pointer font-lora font-medium text-[#C29E4A] pointer-events-auto'
            >
              Sheraton Hanoi West
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Page2
